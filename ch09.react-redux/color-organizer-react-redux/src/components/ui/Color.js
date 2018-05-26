import PropTypes from 'prop-types';
import StarRating from "./StarRating";
import FaTrash from 'react-icons/lib/fa/trash-o';
import '../../../stylesheets/Color.scss'
import TimeAgo from "./TimeAgo";

const Color = ({id, title, color, rating = 0, timestamp, onRemove = f => f, onRate = f => f}) =>
  <section className="color">
    <h1>{title}</h1>
    <button onClick={() => onRemove(id)}>
      <FaTrash/>
    </button>
    <div className="color"
         style={{backgroundColor: color}}>
    </div>
    <TimeAgo timestamp={timestamp} />
    <div>
      <StarRating starsSelected={rating}
                  onRate={(rating) => onRate(id, rating)}/>
    </div>
  </section>;

Color.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  rating: PropTypes.number,
  onRemove: PropTypes.func,
  onRate: PropTypes.func
};

export default Color;