import PropTypes from 'prop-types';
import StarRating from "./StarRating";
import FaTrash from 'react-icons/lib/fa/trash-o';
import '../../../stylesheets/Color.scss'
import TimeAgo from "./TimeAgo";
import {withRouter} from "react-router-dom";


const Color = ({id, title, color, rating = 0, timestamp, onRemove = f => f, onRate = f => f, history}) =>
  <section className="color">
    <h1 onClick={() => history.push(`/${id}`)}>{title}</h1>
    <button onClick={onRemove}>
      <FaTrash/>
    </button>
    <div className="color"
         style={{backgroundColor: color}}
         onClick={() => history.push(`/${id}`)}>
    </div>
    <TimeAgo timestamp={timestamp} />
    <div>
      <StarRating starsSelected={rating}
                  onRate={onRate}/>
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

export default withRouter(Color);