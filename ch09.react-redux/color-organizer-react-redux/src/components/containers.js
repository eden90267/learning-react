import AddColorForm from "./ui/AddColorForm";
import {addColor, rateColor, removeColor, sortColors} from "../actions";
import SortMenu from "./ui/SortMenu";
import ColorList from "./ui/ColorList";
import {sortFunction} from "../lib/array-helpers";
import {connect} from "react-redux";

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

export const Menu = connect(
  // mapStateToProps
  state => ({
    sort: state.sort
  }),
  // mapDispatchToProps
  dispatch => ({
    onSelect(sortBy) {
      dispatch(sortColors(sortBy));
    }
  })
)(SortMenu);


export const Colors = connect(
  // mapStateToProps
  state => ({
    colors: [...state.colors].sort(sortFunction(state.sort))
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