import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import rawData from './data.json';

const EXCLUDE_SELF = false;

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join('/');

function raf() {
  return new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
}

export default class Graph extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  async renderGraph() {
    const nodes = _.uniqBy(
      _.flatMap(rawData.map(d => d.members)).map(player => ({
        ...player,
        id: k(player)
      })),
      player => player.id
    );

    const links = rawData
      .map(link => {
        if (
          link.relationshipKey.includes('0/') ||
          (EXCLUDE_SELF && link.relationshipKey.includes('4611686018469271298'))
        ) {
          return null;
        }

        const [source, target] = link.relationshipKey.split('|');

        return {
          source,
          target,
          value: link.activityCount
        };
      })
      .filter(Boolean);

    window.__data = JSON.parse(JSON.stringify({ nodes, links }));

    const svg = d3.select(this.myRef.current);
    svg
      .style('width', '90vw')
      .style('height', '90vh')
      .style('border', '1px solid grey');

    await raf();

    const { width, height } = svg.node().getBoundingClientRect();

    await raf();

    // svg.attr('viewBox', [-width / 2, -height / 2, width, height]);

    const colourScale = d3.scaleOrdinal(d3.schemeCategory10);
    const color = d => colourScale(d.group);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id(d => d.id)
        // .strength(0.1)
        // .distance(50)
      )
      .force('charge', d3.forceManyBody().strength(() => -200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // const simulation = d3
    //   .forceSimulation(nodes)
    //   .force('link', d3.forceLink(links).id(d => d.id))
    //   .force('charge', d3.forceManyBody())
    //   .force('x', d3.forceX())
    //   .force('y', d3.forceY());

    const isMe = d =>
      d.source.membershipId === '4611686018469271298' ||
      d.target.membershipId === '4611686018469271298';

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', d => 0.6)
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', d => {
        if (isMe(d)) {
          return Math.sqrt(d.value);
          return 0;
        } else {
          return Math.sqrt(d.value);
        }
      });

    const radius = 5;
    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', radius - 0.75)
      .attr('fill', color)
      .call(drag(simulation));

    node.append('title').text(d => d.displayName);

    simulation.on('tick', () => {
      node
        .attr('cx', function(d) {
          return (d.x = Math.max(radius, Math.min(width - radius, d.x)));
        })
        .attr('cy', function(d) {
          return (d.y = Math.max(radius, Math.min(height - radius, d.y)));
        });

      link
        .attr('x1', function(d) {
          return d.source.x;
        })
        .attr('y1', function(d) {
          return d.source.y;
        })
        .attr('x2', function(d) {
          return d.target.x;
        })
        .attr('y2', function(d) {
          return d.target.y;
        });
    });

    // invalidation.then(() => simulation.stop());

    return svg.node();
  }

  componentDidMount() {
    this.renderGraph();
  }

  render() {
    return (
      <div>
        <svg ref={this.myRef} />
      </div>
    );
  }
}

const drag = simulation => {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};
