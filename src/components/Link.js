/*
  This `Link` component is a wrap of the standard
  NextJs `Link` component, with some simple lang
  redirect logic in place.

  If you haven't already, read this issue comment:
  https://github.com/zeit/next.js/issues/2833#issuecomment-414919347

  This component automatically provides this functionality:
  <Link href="/product?slug=something" as="/products/something">

  Wherein `slug` is actually our i18n lang, and it gets
  pulled automatically.

  Very important: if you import `Link` from NextJs directly,
  and not this file, your lang subpath routing will break.
*/

import React from 'react'
import PropTypes from 'prop-types'
import NextLink from 'next/link'
import { withNamespaces } from 'react-i18next'
import { format as formatUrl, parse as parseUrl } from 'url'

const removeWithNamespacesProps = (props) => {
  const strippedProps = Object.assign({}, props)
  delete strippedProps.defaultNS
  delete strippedProps.i18n
  delete strippedProps.i18nOptions
  delete strippedProps.lng
  delete strippedProps.reportNS
  delete strippedProps.t
  delete strippedProps.tReady
  return strippedProps
}

class Link extends React.Component {
  localeSubpathRequired(lng) {
    const { nextI18NextConfig } = this.props
    const { defaultLanguage, localeSubpaths } = nextI18NextConfig.config

    return localeSubpaths && lng && lng !== defaultLanguage
  }

  render() {
    const {
      as, children, href: hrefProp, lng, ...props
    } = this.props

    if (this.localeSubpathRequired(lng)) {
      const href = Link.parseHref(hrefProp)
      const { pathname, query } = href

      return (
        <NextLink
          href={{ pathname, query: { ...query, lng } }}
          as={Link.formatAsProp(as, href, lng)}
          {...removeWithNamespacesProps(props)}
        >
          {children}
        </NextLink>
      )
    }

    return (
      <NextLink
        href={hrefProp}
        as={as}
        {...removeWithNamespacesProps(props)}
      >
        {children}
      </NextLink>
    )
  }
}

Link.formatAsProp = (as, href, lng) => `/${lng}${as || formatUrl(href, { unicode: true })}`

Link.parseHref = (href) => {
  if (typeof href !== 'object') {
    return parseUrl(href, true /* parseQueryString */)
  }

  return href
}

Link.propTypes = {
  as: PropTypes.string,
  children: PropTypes.node.isRequired,
  href: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  nextI18NextConfig: PropTypes.shape({
    config: PropTypes.shape({
      defaultLanguage: PropTypes.string.isRequired,
      localeSubpaths: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
}

Link.defaultProps = {
  as: undefined,
}

/*
  Usage of `withNamespaces` here is just to
  force `Link` to rerender on language change
*/
export default withNamespaces()(Link)
