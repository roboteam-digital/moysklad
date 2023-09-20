'use strict'

const test = require('tape')
const { fetch } = require('undici')

const Moysklad = require('..')
const { MoyskladError } = require('..')

test('Moysklad#parseUrl instance method', t => {
  const ms = Moysklad({ fetch })
  const { endpoint, api, apiVersion } = ms.getOptions()

  const common = { endpoint, api, apiVersion }

  t.deepEqual(
    ms.parseUrl('https://api.moysklad.ru/api/remap/1.2/path/to/my/res'),
    {
      ...common,
      path: ['path', 'to', 'my', 'res'],
      query: {}
    }
  )

  t.deepEqual(
    ms.parseUrl('https://api.moysklad.ru/api/phone/1.0/path/to/my/res'),
    {
      ...common,
      api: 'phone',
      apiVersion: '1.0',
      path: ['path', 'to', 'my', 'res'],
      query: {}
    }
  )

  t.deepEqual(
    ms.parseUrl(
      'https://api.moysklad.ru/api/remap/1.2/path/to/my/res?a=1&b=2&' +
        'a=one&c=&foo.bar=baz&filter=name%3Dfoo%3Bvalue%3Dbar&order=foo%2Casc'
    ),
    {
      ...common,
      path: ['path', 'to', 'my', 'res'],
      query: {
        'a': [1, 'one'],
        'b': 2,
        'c': null,
        'foo.bar': 'baz',
        'filter': 'name=foo;value=bar',
        // TODO Filter parsing
        // filter: {
        //   name: 'foo',
        //   value: 'bar'
        // }
        'order': 'foo,asc'
      }
    }
  )

  t.deepEqual(ms.parseUrl('path/to/my/res'), {
    ...common,
    path: ['path', 'to', 'my', 'res'],
    query: {}
  })

  t.deepEqual(ms.parseUrl(['path', '/to//my/', 'res//']), {
    ...common,
    path: ['path', 'to', 'my', 'res'],
    query: {}
  })

  t.throws(() => {
    try {
      ms.parseUrl('https://foo.ru/bar/baz')
    } catch (err) {
      t.ok(err instanceof MoyskladError)
      throw err
    }
  }, /Url не соответствует/)

  t.throws(() => {
    ms.parseUrl('https://api.moysklad.ru/api/remap/1.2')
  }, /Url не соответствует/)

  t.throws(() => {
    ms.parseUrl('https://api.moysklad.ru/remap/1.2/path')
  }, /Url не соответствует/)

  t.end()
})

test('Moysklad#parseUrl static method', t => {
  t.ok(Moysklad.parseUrl, 'should have parseUrl static method')

  t.deepEqual(
    Moysklad.parseUrl(
      'https://api.moysklad.ru/api/remap/1.2/path/to/my/res?a=1&b=2&' +
        'a=one&c=&foo.bar=baz&filter=name%3Dfoo%3Bvalue%3Dbar&order=foo%2Casc'
    ),
    {
      endpoint: 'https://api.moysklad.ru/api',
      api: 'remap',
      apiVersion: '1.2',
      path: ['path', 'to', 'my', 'res'],
      query: {
        'a': [1, 'one'],
        'b': 2,
        'c': null,
        'foo.bar': 'baz',
        'filter': 'name=foo;value=bar',
        'order': 'foo,asc'
      }
    }
  )

  t.throws(() => {
    try {
      Moysklad.parseUrl('path/to/my/res')
    } catch (err) {
      t.ok(err instanceof MoyskladError)
      throw err
    }
  }, /Для вызова статического метода parseUrl/)

  t.end()
})
