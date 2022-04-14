import { Route, Redirect } from "react-router-dom";

function PrivateRoute({ path, component: Component }) {

    return (<Route
        path={path}
        exact
        render={() => {
            const token = localStorage.getItem("token");
            return token ? <Component /> : <Redirect to="/user/login" />
        }}
    ></Route>);



}

export default PrivateRoute;