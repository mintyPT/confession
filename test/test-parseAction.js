
/* global describe, it */

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');


const lib = require('../index');

/**
 * html to test lib on
 */

describe('confession.parseAction', ()=>{
  it('should parse string commands', () => {
    //  when an action is a function
    const f = () => 'oi';
    expect(lib.parseAction(f)).to.deep.equal({ fun: f });
  
    //
    expect(lib.parseAction('selector')).to.deep.equal({ fun: 'selector' });
    expect(lib.parseAction('selector:h1')).to.deep.equal({
      fun: 'selector',
      args: ['h1'],
    });
    expect(lib.parseAction('selector:h1|h2')).to.deep.equal({
      fun: 'selector',
      args: ['h1', 'h2'],
    });
    expect(lib.parseAction('attribute:class')).to.deep.equal({
      fun: 'attribute',
      args: ['class'],
    });
  });
  
  it('should structure array commands', () => {
    expect(lib.parseAction(['selector'])).to.deep.equal({
      fun: 'selector',
    });
    expect(lib.parseAction(['selector', 'h1', 'h2'])).to.deep.equal({
      fun: 'selector',
      args: ['h1', 'h2'],
    });
  });
})


