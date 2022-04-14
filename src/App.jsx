
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import NotFound from "./components/NotFound/NotFound";
import Home from "./components/home/Home";
import Profile from "./components/profile/Profile";
import NewPost from "./components/newpost/NewPost";
import Explore from "./components/explore/Explore";
import ViewPost from "./components/viewpost/ViewPost";
import ProfileEdit from "./components/profileedit/ProfileEdit";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import PrivateRoute from "./components/privateroute/PrivateRoute";
import Following from "./components/following/Following";
import Followers from "./components/followers/Followers";
import Messenger from "./components/messenger/Messenger";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import axios from "axios";
import { ToastContainer } from "react-toastify"

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  axios.defaults.baseURL = process.env.REACT_APP_BACKEND;

  return <div className="App">
    <ToastContainer position='top-center' />
    <BrowserRouter>
      <Switch>
        <PrivateRoute path="/" exact component={Home}></PrivateRoute>
        <Route path="/home" exact component={Home}><Redirect to="/"></Redirect></Route>

        <Route path="/user/login" exact component={Login}></Route>
        <Route path="/user/register" exact component={Register}></Route>
        <Route path="/user/forgotpassword" exact component={ForgotPassword}></Route>
        <Route path="/user/resetpassword/:jwt" exact component={ResetPassword}></Route>

        <PrivateRoute path="/newpost" exact component={NewPost}></PrivateRoute>
        <PrivateRoute path="/explore" exact component={Explore}></PrivateRoute>
        <PrivateRoute path="/messenger" exact component={Messenger}></PrivateRoute>
        <PrivateRoute path="/posts/:id" exact component={ViewPost}></PrivateRoute>
        <PrivateRoute path="/posts/:id/:op" exact component={ViewPost}></PrivateRoute>

        <PrivateRoute path="/profile/edit" exact component={ProfileEdit} ></PrivateRoute>
        <PrivateRoute path="/profile/following/:id" exact component={Following} ></PrivateRoute>
        <PrivateRoute path="/profile/followers/:id" exact component={Followers} ></PrivateRoute>
        <PrivateRoute path="/profile" component={Profile} ></PrivateRoute>
        <Route path="*" component={NotFound}></Route>

      </Switch>
    </BrowserRouter>
  </div>
}

export default App;