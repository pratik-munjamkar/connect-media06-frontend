import { NavLink } from "react-router-dom";
import { Nav, Container, Navbar } from "react-bootstrap";
import { FaHandsHelping } from "react-icons/fa";

import "./Header.css"

function Header() {
    return <header className="headerMain">
        <Navbar className="headerNavbar" collapseOnSelect expand="lg" variant="dark">
            <Container>
                <NavLink className="headerNavbarLogo" to="/"><span ><FaHandsHelping /> </span> Connect</NavLink>

                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                    </Nav>
                    <Nav>
                        <NavLink exact activeStyle={{ color: "gold" }} className="navLinks"
                            to="/">Home</NavLink>
                        <NavLink activeStyle={{ color: "gold" }} className="navLinks"
                            to="/newpost">Post</NavLink>
                        <NavLink activeStyle={{ color: "gold" }} className="navLinks"
                            to="/messenger">Direct</NavLink>
                        <NavLink activeStyle={{ color: "gold" }} className="navLinks"
                            to="/explore">Explore</NavLink>
                        <NavLink activeStyle={{ color: "gold" }} className="navLinks"
                            to="/profile">Profile</NavLink>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </header>

}

export default Header;