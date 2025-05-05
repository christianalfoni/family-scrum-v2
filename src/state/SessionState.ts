import { User as FirebaseUser } from "firebase/auth";
import type { FamilyDTO, UserDTO } from "../environment/Persistence";
import { FamilyScrumState } from "./FamilyScrumState";
import { Environment } from "../environment";

type CachedAuthentication = { user: UserDTO; family: FamilyDTO };

const AUTHENTICATION_CACHE_KEY = "family_scrum_authentication";

class UNAUTHENTICATED {
  readonly current = "UNAUTHENTICATED";
  constructor(
    private env: Environment,
    private sessionState: SessionState,
    public error?: string
  ) {}
  signIn() {
    this.sessionState.state = new AUTHENTICATING();
    this.env.authentication.signIn();
  }
}

class AUTHENTICATING {
  readonly current = "AUTHENTICATING";
}

class AUTHENTICATED {
  readonly current = "AUTHENTICATED";
  constructor(
    private env: Environment,
    public user: UserDTO,
    public family: FamilyDTO
  ) {}
  familyScrum = new FamilyScrumState(this.env, this.user, this.family);
}

export class SessionState {
  constructor(private env: Environment) {
    // It takes quite a long time for Firebase to evalaute the curent session, we
    // use a cached user and family to get rolling faster
    const cachedAuthentication: CachedAuthentication | null = JSON.parse(
      localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null"
    );

    this.state = cachedAuthentication
      ? new AUTHENTICATED(
          this.env,
          cachedAuthentication.user,
          cachedAuthentication.family
        )
      : new AUTHENTICATING();

    env.authentication.onChanged((user) => this.onAuthChanged(user));
  }
  state: AUTHENTICATED | AUTHENTICATING | UNAUTHENTICATED;

  private async onAuthChanged(maybeUser: FirebaseUser | null) {
    if (!maybeUser) {
      this.state = new UNAUTHENTICATED(this.env, this);

      return;
    }

    try {
      // As part of being authenticated we also want to grab information
      // about the users family reference and the family itself
      const user = await this.env.persistence.users.get(maybeUser.uid);

      if (!user) {
        throw new Error("No user doc");
      }

      const family = await this.env.persistence.families.get(user.familyId);

      if (!family) {
        throw new Error("No family doc");
      }

      if (
        this.state.current === "AUTHENTICATED" &&
        this.state.user.id === user.id &&
        this.state.user.familyId === user.familyId
      ) {
        return;
      }

      // Theoretically we could already be unauthenticated by Firebase for whatever reason. Something
      // like RxJS would be interesting to explore here.
      this.state = new AUTHENTICATED(this.env, user, family);

      localStorage.setItem(
        AUTHENTICATION_CACHE_KEY,
        JSON.stringify({ user, family })
      );
    } catch (e) {
      this.state = new UNAUTHENTICATED(this.env, this, String(e));
    }
  }
}
