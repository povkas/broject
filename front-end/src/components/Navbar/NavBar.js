import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Menu, Person } from '@material-ui/icons';
import { Link, BrowserRouter } from 'react-router-dom';
import Styles from './Styles';
import Search from './Search';

function NavBar(props) {
  const { classes } = props;
  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <IconButton className={classes.menuButton}>
            <Menu />
          </IconButton>
          <Typography variant="h6" color="inherit">
            <Link to="/" className={classes.shopName}>
              BimBam
            </Link>
          </Typography>
          <Search />
          <IconButton className={classes.menuButton}>
            <Person />
          </IconButton>
          <IconButton className={classes.menuButton}>
            <ShoppingCart />
          </IconButton>
        </Toolbar>
      </AppBar>
    </BrowserRouter>
  );
}

NavBar.propTypes = {
  classes: PropTypes.shape().isRequired
};

export default withStyles(Styles)(NavBar);
