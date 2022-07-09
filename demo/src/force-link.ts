// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Force, SimulationLinkDatum, SimulationNodeDatum } from 'd3-force'

function constant(x) {
  return function () {
    return x
  }
}

function jiggle(random) {
  return (random() - 0.5) * 1e-6
}

function index(d) {
  return d.index
}

function find(nodeById, nodeId) {
  const node = nodeById.get(nodeId)
  if (!node) throw new Error('node not found: ' + nodeId)
  return node
}

export function forceLink<
  NodeDatum extends SimulationNodeDatum,
  LinkDatum extends SimulationLinkDatum<NodeDatum> & { weight: number },
>(links: LinkDatum[] | null): Force {
  let id = index,
    strength = defaultStrength,
    strengths
  let distance = constant(30),
    distances,
    nodes,
    count,
    bias
  let iterations = 1
  let random: number
  if (links == null) links = []

  function defaultStrength(link: LinkDatum) {
    return 1 / Math.min(count[link.source.index], count[link.target.index])
  }

  function force(alpha: number): void {
    for (let k = 0, n = links.length; k < iterations; ++k) {
      let link, source, target, x, y, l, b
      for (let i = 0; i < n; ++i) {
        ;(link = links[i]), (source = link.source), (target = link.target)
        x = target.x + target.vx - source.x - source.vx || jiggle(random)
        y = target.y + target.vy - source.y - source.vy || jiggle(random)
        l = Math.sqrt((x * x) / 5 + y * y)
        l = ((l - distances[i]) / l) * alpha * strengths[i]
        ;(x *= l), (y *= l)
        target.vx -= x * (b = bias[i])
        target.vy -= y * b
        source.vx += x * (b = 1 - b)
        source.vy += y * b

        // if (horizontal) {
        source.vy -= (8 * alpha * link.weight * strengths[i]) / Math.max(y, 2)
        target.vy += (8 * alpha * link.weight * strengths[i]) / Math.max(y, 2)
        // } else
        //   source.vy -=
        //     (0.8 * alpha * link.weight * strengths[i]) / Math.max(y, 2);
        // target.vy +=
        //   (0.8 * alpha * link.weight * strengths[i]) / Math.max(y, 2);
      }
    }
  }

  function initialize() {
    if (!nodes) return

    let i
    const n = nodes.length
    const m = links.length
    const nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d]))
    let link

    for (i = 0, count = new Array(n); i < m; ++i) {
      ;(link = links[i]), (link.index = i)
      if (typeof link.source !== 'object')
        link.source = find(nodeById, link.source)
      if (typeof link.target !== 'object')
        link.target = find(nodeById, link.target)
      count[link.source.index] = (count[link.source.index] || 0) + 1
      count[link.target.index] = (count[link.target.index] || 0) + 1
    }

    for (i = 0, bias = new Array(m); i < m; ++i) {
      ;(link = links[i]),
        (bias[i] =
          count[link.source.index] /
          (count[link.source.index] + count[link.target.index]))
    }

    ;(strengths = new Array(m)), initializeStrength()
    ;(distances = new Array(m)), initializeDistance()
  }

  function initializeStrength() {
    if (!nodes) return

    for (let i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i], i, links)
    }
  }

  function initializeDistance() {
    if (!nodes) return

    for (let i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance(links[i], i, links)
    }
  }

  force.initialize = function (_nodes, _random) {
    nodes = _nodes
    random = _random
    initialize()
  }

  force.links = function (_) {
    return arguments.length > 0 ? ((links = _), initialize(), force) : links
  }

  force.id = function (_) {
    return arguments.length > 0 ? ((id = _), force) : id
  }

  force.iterations = function (_) {
    return arguments.length > 0 ? ((iterations = +_), force) : iterations
  }

  force.strength = function (_) {
    return arguments.length > 0
      ? ((strength = typeof _ === 'function' ? _ : constant(+_)),
        initializeStrength(),
        force)
      : strength
  }

  force.distance = function (_) {
    return arguments.length > 0
      ? ((distance = typeof _ === 'function' ? _ : constant(+_)),
        initializeDistance(),
        force)
      : distance
  }

  return force
}
