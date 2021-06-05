import * as React from 'react'
import { createContext, createHook, createReducer } from "react-states"
import { useDevtools } from 'react-states/devtools'

type Context = {
    state: 'SELECTING_ONBOARDING'
}

type UIEvent = {
    type: 'CREATE_FAMILY_SELECTED'
}

type Event = UIEvent

const featureContext = createContext<Context, UIEvent>()

export const useFeature = createHook(featureContext)

const reducer = createReducer<Context, Event>({
    SELECTING_ONBOARDING: {}
})

export const Feature = ({
    children,
    initialContext = {
        state: 'SELECTING_ONBOARDING'
    }
}: {
    children: React.ReactNode
    initialContext: Context
}) => {
    const feature = React.useReducer(reducer, initialContext)

    if (process.env.NODE_ENV === 'development' && process.browser) {
        useDevtools('Onboarding', feature)
    }

    return (
        <featureContext.Provider value={feature}>
            {children}
        </featureContext.Provider>
    )
}