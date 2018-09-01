// @flow
import { rpc } from 'neon-js'
import { createActions } from 'spunky'
import { NODES } from '../core/constants'

const getBlockCount = async node =>
  new Promise(resolve => {
    let url = node.protocol ? `${node.protocol}://${node.url}` : node.url
    url = node.port ? `${url}:${node.port}` : url

    const client = new rpc.RPCClient(url)
    client
      .ping()
      .then(latency => {
        if (client.lastSeenHeight !== 0) {
          resolve({
            url,
            blockCount: client.lastSeenHeight,
            latency
          })
        }
      })
      .catch({})
  })

const ID = 'nodes'

const raceNodePromises = (total, promises) => {
  const responses = []
  return new Promise(resolve =>
    promises.forEach(promise =>
      promise.then(result => {
        responses.push(result)
        if (responses.length === total) resolve(responses)
      })
    )
  )
}

export default createActions(
  ID,
  ({ nodes = NODES, totalDisplayed = 15 }: Props = {}) => async () => {
    const promises = nodes.map(node => getBlockCount(node))
    const result = await raceNodePromises(totalDisplayed, promises)
    return result
  }
)