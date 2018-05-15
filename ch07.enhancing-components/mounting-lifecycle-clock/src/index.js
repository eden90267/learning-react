import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import Clock from "./components/Clock";

window.React = React;

const target = document.getElementById('react-container');

render(
  <Clock onClose={() => unmountComponentAtNode(target)}/>,
  target
);