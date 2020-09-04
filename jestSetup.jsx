// setup file
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
require("jest-localstorage-mock");
require("jest-fetch-mock").enableFetchMocks();
configure({ adapter: new Adapter() });