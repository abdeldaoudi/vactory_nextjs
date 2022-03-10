import React from "react"
import Head from "next/head"
import { fetcher } from "../jsonapi"
import { TemplatesMapping } from "../../.tmp/node-templates"
import { NodeApiRoutesMapping } from "../../.tmp/node-api-routes"
import NodeDefault from "./NodeDefault"
import logger from "../logger/logger"
import { getLocaleFromPath } from "../utils"
import getConfig from "next/config"

import LRUCache from "lru-cache"

// @todo: disable dev ? used only in routing ?
const ssrCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60, // 1 hour
})

export const NodeHandler = ({ node, params }) => {
  const Component = TemplatesMapping[node.type] || NodeDefault
  return (
    <React.Fragment>
      <Head>
        <link rel="preload" as="image/svg+xml" href="/icons.svg" />
        <title>{node?.title}</title>
        <meta
          name="description"
          content="A Next.js site powered by a Drupal backend."
        />
      </Head>
      <Component node={node} params={params} />
    </React.Fragment>
  )
}

export async function getServerSideProps(context) {
  const { publicRuntimeConfig } = getConfig()
  let { slug } = context.params
  const params = context.query
  delete params.slug
  slug = Array.isArray(slug) ? slug.join("/") : slug
  const langprefix = getLocaleFromPath(
    slug,
    publicRuntimeConfig.i18n.availableLanguages
  )
  const locale = langprefix ? `${langprefix}/` : ``

  // Router stuff
  try {
    const cacheRouterKey = `${locale}-${slug}`
    let router

    if (!ssrCache.has(cacheRouterKey)) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/${locale}router/translate-path?path=${slug}`
      )

      if (!response.ok) {
        return {
          notFound: true,
        }
      }

      router = await response.json()
      ssrCache.set(cacheRouterKey, router)
    } else {
      router = ssrCache.get(cacheRouterKey)
    }

    // Check for redirect.
    if (router.redirect?.length) {
      const [redirect] = router.redirect
      return {
        redirect: {
          destination: redirect.to,
          permanent: redirect.status === "301",
        },
      }
    }

    // Fetch data from external API.
    const nodeParams = NodeApiRoutesMapping[router.jsonapi.resourceName]
    // @todo: send params to Drupal JSON:API
    const node = await fetcher(router.jsonapi.individual, {
      params: nodeParams,
    })

    const langcode = node.langcode

    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    )

    // Pass data to the page via props
    return {
      props: {
        node: node,
        params: params && Object.keys(params).length > 0 ? params : null,
        i18n: (await import(`translations/${langcode}.json`)).default,
        locale: langcode,
      },
    }
  } catch (err) {
    logger.info(err)
  }

  return {
    notFound: true,
  }
}
