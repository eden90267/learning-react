import {shallow} from 'enzyme';
import Star from "../../../src/components/ui/Star";

describe('<Star /> UI Component', () => {

  it('renders default star', function () {
    expect(
      shallow(<Star/>)
        .find()
    )
  });

});