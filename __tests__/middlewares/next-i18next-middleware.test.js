/* eslint-env jest */

import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, handleLanguageSubpath, lngPathDetector } from 'utils'
import testConfig from '../test-config'

import nextI18nextMiddleware from '../../src/middlewares/next-i18next-middleware'

jest.mock('i18next-express-middleware', () => ({
  handle: jest.fn(() => 'i18nextMiddleware'),
}))

jest.mock('utils', () => ({
  forceTrailingSlash: jest.fn(),
  handleLanguageSubpath: jest.fn(),
  lngPathDetector: jest.fn(),
}))

jest.mock('url', () => ({
  parse: jest.fn(),
}))

describe('next-18next middleware', () => {
  let nexti18next
  let req
  let res
  let next

  beforeEach(() => {
    nexti18next = {
      config: { ...testConfig.options },
      i18n: 'i18n',
    }

    req = {
      url: '/myapp.com/',
    }
    res = {}
    next = jest.fn()
  })

  afterEach(() => {
    i18nextMiddleware.handle.mockReset()

    forceTrailingSlash.mockReset()
    handleLanguageSubpath.mockReset()
    lngPathDetector.mockReset()
  })

  it('sets up i18nextMiddleware handle on setup', () => {
    const middleware = nextI18nextMiddleware(nexti18next)

    expect(i18nextMiddleware.handle)
      .toBeCalledWith('i18n',
        expect.objectContaining({
          ignoreRoutes: expect.arrayContaining(['/_next', '/static']),
        }))
    expect(middleware[0]).toEqual('i18nextMiddleware')
  })

  it('does not call any next-i18next middleware if localeSubpaths === false', () => {
    nexti18next.config.localeSubpaths = false

    const [, middleware] = nextI18nextMiddleware(nexti18next)
    middleware(req, res, next)

    expect(forceTrailingSlash).not.toBeCalled()
    expect(lngPathDetector).not.toBeCalled()
    expect(handleLanguageSubpath).not.toBeCalled()

    expect(next).toBeCalled()
  })

  describe('localeSubpaths === true', () => {
    beforeEach(() => {
      nexti18next.config.localeSubpaths = true
    })

    it('does not call forceTrailingSlash or lngPathDetector, if route to ignore', () => {
      req.url = '/_next/route'

      const [, middleware] = nextI18nextMiddleware(nexti18next)
      middleware(req, res, next)

      expect(forceTrailingSlash).not.toBeCalled()
      expect(lngPathDetector).not.toBeCalled()
      expect(handleLanguageSubpath).not.toBeCalled()

      expect(next).toBeCalled()
    })

    it('calls only forceTrailingSlash if redirect performed', () => {
      req.url = '/myapp.com'
      forceTrailingSlash.mockImplementation(() => true)

      const [, middleware] = nextI18nextMiddleware(nexti18next)
      middleware(req, res, next)

      expect(forceTrailingSlash).toBeCalledWith(['en', 'de'], req, res)
      expect(lngPathDetector).not.toBeCalled()
      expect(handleLanguageSubpath).not.toBeCalled()

      expect(next).not.toBeCalled()
    })

    it('calls only forceTrailingSlash and lngPathDetector if no redirect and not a localeRoute', () => {
      req.url = '/page/'
      forceTrailingSlash.mockImplementation(() => false)

      const [, middleware] = nextI18nextMiddleware(nexti18next)
      middleware(req, res, next)

      expect(forceTrailingSlash).toBeCalledWith(['en', 'de'], req, res)
      expect(lngPathDetector).toBeCalledWith(req, res)
      expect(handleLanguageSubpath).not.toBeCalled()

      expect(next).toBeCalled()
    })

    it('calls all middleware if a localeRoute', () => {
      req.url = '/de/page/'
      forceTrailingSlash.mockImplementation(() => false)

      const [, middleware] = nextI18nextMiddleware(nexti18next)
      middleware(req, res, next)

      expect(forceTrailingSlash).toBeCalledWith(['en', 'de'], req, res)
      expect(lngPathDetector).toBeCalledWith(req, res)
      expect(handleLanguageSubpath).toBeCalledWith(req, 'de')

      expect(next).toBeCalled()
    })
  })
})
