import '../../../stylesheets/ColorDetails.scss';

const ColorDetails = ({title, color, history}) =>
  <div className="color-details"
       style={{backgroundColor: color}}
       onClick={() => history.goBack()}>
    <h1>{title}</h1>
    <h1>{color}</h1>
  </div>;

export default ColorDetails;