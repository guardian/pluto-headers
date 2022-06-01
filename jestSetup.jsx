// setup file
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import nodeCrypto from 'crypto';

require("jest-localstorage-mock");
require("jest-fetch-mock").enableFetchMocks();

configure({ adapter: new Adapter() });

//polyfills the browser window.crypto object so we can use it in tests

window.crypto = {
    getRandomValues: function(buffer) {
        return nodeCrypto.randomFillSync(buffer);
    }
}