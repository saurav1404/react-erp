import { assert } from 'chai';
import { shallow } from 'enzyme';
import * as React from 'react';
import Contact from './Contact';

describe('Contact activity', () => {
  it('Should render correctly', () => {
    const component = shallow((
      <Contact classNames={{}} image='no-image.png' />
    ));

    assert.equal(component.find('h3').text(), 'Contact');
    assert.equal(component.find('p').text(), 'Works.');
  });
});
