import PropTypes from 'prop-types';
import Color from "./Color";
import '../../../stylesheets/ColorList.scss';


const ColorList = ({colors = [], onRemove = f => f, onRate = f => f}) => {
  return (
    <div className="color-list">
      {(colors.length === 0) ?
        <p>No Colors Listed. (Add a Color)</p> :
        colors.map(color =>
          <Color key={color.id}
                 {...color}
                 onRemove={() => onRemove(color.id)}
                 onRate={(rating) => onRate(color.id, rating)}/>
        )
      }
    </div>
  );
};

Color.propTypes = {
  colors: PropTypes.array
};

export default ColorList;