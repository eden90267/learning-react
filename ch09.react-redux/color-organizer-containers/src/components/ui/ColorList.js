import PropTypes from 'prop-types';
import Color from "./Color";
import '../../../stylesheets/ColorList.scss';


const ColorList = ({colors = []}) => {
  return (
    <div className="color-list">
      {(colors.length === 0) ?
        <p>No Colors Listed. (Add a Color)</p> :
        colors.map(color =>
          <Color key={color.id} {...color}/>
        )
      }
    </div>
  );
};

Color.propTypes = {
  colors: PropTypes.array
};

export default ColorList;