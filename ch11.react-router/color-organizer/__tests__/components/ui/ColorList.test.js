import {mount, shallow} from "enzyme";
import ColorList from "../../../src/components/ui/ColorList";

jest.mock('../../../src/components/ui/Color', () =>
  ({rating, onRate = f => f, onRemove = f => f}) =>
    <div className="mock-color">
      <button className="rate" onClick={() => onRate(rating)}></button>
      <button className="remove" onClick={onRemove}></button>
    </div>
);



describe('<ColorList /> UI Component', () => {

  describe('Rating a Color', () => {

    let _rate = jest.fn();

    beforeAll(() =>
      mount(<ColorList colors={_testColors} onRate={_rate}/>)
        .find('button.rate')
        .first()
        .simulate('click')
    );

    it('invokes onRate Handler', () => {
      expect(_rate).toBeCalled();
    });

    it('rates the correct color', () => {
      expect(_rate).toBeCalledWith(
        '8658c1d0-9eda-4a90-95e1-8001e8eb6036',
        4
      )
    });

  });

  describe('Remove a Color', () => {

    let _remove = jest.fn();

    beforeAll(() =>
      mount(<ColorList colors={_testColors} onRemove={_remove}/>)
        .find('button.remove')
        .first()
        .simulate('click')
    );

    it('invokes onRemove Handler', () => {
      expect(_remove).toBeCalled();
    });

    it('remove the correct color', () => {
      expect(_remove).toBeCalledWith(
        '8658c1d0-9eda-4a90-95e1-8001e8eb6036'
      )
    });


  });

  describe('Rendering UI', () => {

    it('Defaults properties correctly', () => {
      expect(shallow(<ColorList/>).find('p').text())
        .toBe('No Colors Listed. (Add a Color)')
    });

    it('Clicking default rate button does not cause', () => {
      mount(<ColorList colors={_testColors}/>)
        .find('button.rate')
        .first()
        .simulate('click');
    });

    it('Clicking default remove button does not cause', () => {
      mount(<ColorList colors={_testColors}/>)
        .find('button.remove')
        .first()
        .simulate('click');
    });

  });

});