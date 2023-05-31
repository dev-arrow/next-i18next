/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'

import linkFunction from '../../src/components/Link'

jest.mock('next/link')

describe('Link component', () => {
  let context
  let props

  beforeEach(() => {
    context = {}

    context.config = {
      defaultLanguage: 'en',
      localeSubpaths: false,
    }

    context.i18n = {
      languages: ['de', 'en'],
    }

    context.withNamespaces = () => Component => Component

    props = {
      href: '/foo/bar',
      lng: 'de',
    }
  })

  const createLinkComponent = () => {
    const Link = linkFunction.apply(context)

    return mount(<Link {...props}>click here</Link>).find('Link').at(1)
  }

  it('renders without lang if localeSubpaths === false', () => {
    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeUndefined()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders without lang if props.lng is undefined', () => {
    context.config.localeSubpaths = true
    props.lng = undefined

    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeUndefined()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders without lang if props.lng === defaultLanguage', () => {
    context.config.localeSubpaths = true
    context.config.defaultLanguage = 'en'
    props.lng = 'en'

    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeUndefined()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders with lang', () => {
    context.config.localeSubpaths = true
    context.config.defaultLanguage = 'en'

    // without 'as' prop -- no query parameters
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual({ pathname: '/foo/bar', query: { lng: 'de' } })
    expect(component.prop('as')).toEqual('/de/foo/bar')

    // without 'as' prop -- query parameters
    props.href = '/foo/bar?baz'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual({ pathname: '/foo/bar', query: { baz: '', lng: 'de' } })
    expect(component.prop('as')).toEqual('/de/foo/bar?baz')

    props.href = '/foo/bar'

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual({ pathname: '/foo/bar', query: { lng: 'de' } })
    expect(component.prop('as')).toEqual('/de/foo?bar')
  })
})
