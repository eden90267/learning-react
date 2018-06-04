import AddColorForm from "./ui/AddColorForm";
import {addColor, rateColor, removeColor} from "../actions";
import ColorList from "./ui/ColorList";
import {findById, sortColors} from "../lib/array-helpers";
import {connect} from "react-redux";
import ColorDetails from "./ui/ColorDetails";

export const NewColor = connect(
  // mapStateToProps
  null,
  // mapDispatchToProps
  dispatch => ({
    onNewColor(title, color) {
      dispatch(addColor(title, color));
    }
  })
)(AddColorForm);

export const Colors = connect(
  // mapStateToProps
  ({colors}, {match}) => ({
    colors: sortColors(colors, match.params.sort)
  }),
  // mapDispatchToProps
  dispatch => ({
    onRemove(id) {
      dispatch(removeColor(id));
    },
    onRate(id, rating) {
      dispatch(rateColor(id, rating));
    }
  })
)(ColorList);

export const Color = connect(
  (state, props) =>
    findById(state.colors, props.match.params.id)
)(ColorDetails);