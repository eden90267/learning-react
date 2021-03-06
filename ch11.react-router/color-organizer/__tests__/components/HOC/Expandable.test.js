import {mount} from 'enzyme';
import Expandable from '../../../src/components/HOC/Expandable';

describe('Expandable Higher-Order Component', () => {

  let props,
    wrapper,
    ComposedComponent,
    MockComponent = ({collapsed, expandCollapse}) =>
      <div onClick={expandCollapse}>
        {(collapsed) ? 'collapsed' : 'expanded'}
      </div>;

  describe('Rendering UI', () => {

    beforeAll(() => {
      ComposedComponent = Expandable(MockComponent);
      wrapper = mount(<ComposedComponent foo="foo" gnar="gnar"/>);
      props = wrapper.find(MockComponent).props();
    });

    it('starts off collapsed', () => {
      expect(props.collapsed).toBe(true);
    });

    it('passes the expandCollapse function to composed component', () => {
      expect(typeof props.expandCollapse)
        .toBe('function')
    });

    it('passes additional foo prop to composed component', () => {
      expect(props.foo)
        .toBe('foo');
    });

    it('passes additional gnar prop to composed component', () => {
      expect(props.gnar)
        .toBe('gnar');
    });

  });

  describe('Expand Collapse Functionality', () => {
    let instance

    beforeAll(() => {
      ComposedComponent = Expandable(MockComponent);
      wrapper = mount(<ComposedComponent collapsed={false}/>)
      instance = wrapper.instance();
    });

    it('renders the MockComponent as the root element', () => {
      expect(wrapper.first().is(MockComponent)); // first 取第一個子元素
    });

    it('starts off expanded', function () {
      expect(instance.state.collapsed).toBe(false);
    });

    it('toggles the collapsed state', () => {
      instance.expandCollapse();
      expect(instance.state.collapsed).toBe(true);
    });

  });

});