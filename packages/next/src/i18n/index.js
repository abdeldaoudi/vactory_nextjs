import { createContext, useContext, useState, useRef, useEffect } from "react"
import rosetta from "rosetta"
// import rosetta from 'rosetta/debug';
import { getDefaultLanguage } from "../utils"

const i18n = rosetta()

export const defaultLanguage = getDefaultLanguage()

export const I18nContext = createContext()

// default language
i18n.locale(defaultLanguage)

export const I18n = ({ children, locale, lngDict }) => {
	const activeLocaleRef = useRef(locale || defaultLanguage)
	const [, setTick] = useState(0)
	const firstRender = useRef(true)

	const i18nWrapper = {
		activeLocale: activeLocaleRef.current,
		t: (...args) => i18n.t(...args),
		locale: (l, dict) => {
			i18n.locale(l)
			activeLocaleRef.current = l
			if (dict) {
				i18n.set(l, dict)
			}
			// force rerender to update view
			setTick((tick) => tick + 1)
		},
	}

	// for initial SSR render
	if (locale && firstRender.current === true) {
		firstRender.current = false
		i18nWrapper.locale(locale, lngDict)
	}

	// when locale is updated
	useEffect(() => {
		if (locale) {
			i18nWrapper.locale(locale, lngDict)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lngDict, locale])

	return <I18nContext.Provider value={i18nWrapper}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
	const i18n = useContext(I18nContext)
	return i18n
}
