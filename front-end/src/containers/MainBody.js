import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Route } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import { isEqual } from 'lodash';
import ProductModal from '../components/productModal/ProductModal';
import ProductTable from '../components/productTable/ProductTable';
import { getProducts } from '../actions/productActions';
import Filter from '../components/productTable/Filter';

const color = grey[100];

const Styles = () => ({
  paper: {
    flexGrow: 1,
    backgroundColor: color,
    width: '50vw',
    minHeight: '90vh',
    margin: '2vh'
  }
});

class MainBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isProductModalOpen: false,
      selectedProduct: {},
      allProducts: [],
      productsOnDisplay: [],
      lowerPriceLimit: 0,
      upperPriceLimit: 0,
      date: 'all',
      lowerPriceLimitHelper: '',
      upperPriceLimitHelper: ''
    };

    this._isMounted = false;

    this.changeDate = this.changeDate.bind(this);
    this.changePriceLower = this.changePriceLower.bind(this);
    this.changePriceUpper = this.changePriceUpper.bind(this);
    this.checkPriceUpper = this.checkPriceUpper.bind(this);
    this.checkPriceLower = this.checkPriceLower.bind(this);
    this.checkDate = this.checkDate.bind(this);
  }

  componentDidMount() {
    getProducts().then(res => {
      this.setState({ allProducts: res, productsOnDisplay: res });
    });
    this._isMounted = true;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isModalToggled = !isEqual(this.state, nextState);
    return isModalToggled;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleOpen = () => {
    if (this._isMounted === true) {
      this.setState({ isProductModalOpen: true });
    }
  };

  handleClose = () => {
    this.setState({ isProductModalOpen: false });
  };

  changeProduct = product => {
    if (this._isMounted === true) {
      this.setState({
        selectedProduct: product,
        isProductModalOpen: true
      });
    }
  };

  changeShownProducts() {
    const { upperPriceLimit, lowerPriceLimit, allProducts } = this.state;
    let qualifyingProducts = [];

    if (upperPriceLimit >= lowerPriceLimit && upperPriceLimit > 0) {
      qualifyingProducts = allProducts.filter(this.checkPriceUpper);
      this.setState({ upperPriceLimitHelper: '' });
    } else if (upperPriceLimit < lowerPriceLimit) {
      this.setState({ upperPriceLimitHelper: 'Number smaller than lower bound number' });
      qualifyingProducts = allProducts;
    } else if (upperPriceLimit < 0) {
      this.setState({ upperPriceLimitHelper: 'Number cannot be negative' });
      qualifyingProducts = allProducts;
    } else {
      this.setState({ upperPriceLimitHelper: '' });
      qualifyingProducts = allProducts;
    }

    if (lowerPriceLimit >= 0) {
      this.setState({ lowerPriceLimitHelper: '' });
      qualifyingProducts = qualifyingProducts.filter(this.checkPriceLower);
    } else if (lowerPriceLimit < 0) {
      this.setState({ lowerPriceLimitHelper: 'Number cannot be negative' });
    }

    qualifyingProducts = qualifyingProducts.filter(this.checkDate);
    this.setState({ productsOnDisplay: qualifyingProducts });
  }

  changeDate(e) {
    this.setState({ date: e.target.value }, () => this.changeShownProducts());
  }

  changePriceLower(e) {
    this.setState({ lowerPriceLimit: parseFloat(e.target.value) }, () =>
      this.changeShownProducts()
    );
  }

  changePriceUpper(e) {
    this.setState({ upperPriceLimit: parseFloat(e.target.value) }, () =>
      this.changeShownProducts()
    );
  }

  checkPriceUpper(product) {
    const { upperPriceLimit } = this.state;
    return product.price <= upperPriceLimit;
  }

  checkPriceLower(product) {
    const { lowerPriceLimit } = this.state;
    return product.price >= lowerPriceLimit;
  }

  checkDate(product) {
    const { date } = this.state;
    let dateFromDatabase = product.created;
    dateFromDatabase = dateFromDatabase.replace(/:| /g, '-');
    dateFromDatabase = dateFromDatabase.replace('T', '-');
    const YMDhms = dateFromDatabase.split('-');
    const correctDate = new Date();
    const radix = 10;
    correctDate.setFullYear(
      parseInt(YMDhms[0], radix),
      parseInt(YMDhms[1], radix) - 1,
      parseInt(YMDhms[2], radix)
    );
    correctDate.setHours(
      parseInt(YMDhms[3], radix),
      parseInt(YMDhms[4], radix),
      parseInt(YMDhms[5], radix),
      0
    );

    switch (date) {
      case 'day':
        return new Date() - correctDate < 86400000;
      case 'week':
        return new Date() - correctDate < 86400000 * 7;
      case 'month':
        return new Date() - correctDate < 86400000 * 31;
      case 'year':
        return new Date().getFullYear() - correctDate.getFullYear() < 1;
      default:
        return true;
    }
  }

  render() {
    const { classes } = this.props;
    const {
      isProductModalOpen,
      selectedProduct,
      productsOnDisplay,
      lowerPriceLimit,
      upperPriceLimit,
      date,
      lowerPriceLimitHelper,
      upperPriceLimitHelper
    } = this.state;
    return (
      <div>
        <ProductModal
          openModal={isProductModalOpen}
          handleClose={this.handleClose}
          product={selectedProduct}
        />
        <Grid container direction="row" justify="space-evenly" alignItems="center">
          <Grid item>
            <Paper className={classes.paper} elevation={24}>
              <Filter
                lowerPriceLimit={lowerPriceLimit}
                upperPriceLimit={upperPriceLimit}
                date={date}
                changeDate={this.changeDate}
                changePriceLower={this.changePriceLower}
                changePriceUpper={this.changePriceUpper}
                lowerPriceLimitHelper={lowerPriceLimitHelper}
                upperPriceLimitHelper={upperPriceLimitHelper}
              />
              <BrowserRouter>
                <Route
                  path="/"
                  component={() => (
                    <ProductTable
                      openProduct={this.handleOpen}
                      productHandler={this.changeProduct}
                      products={productsOnDisplay}
                    />
                  )}
                />
              </BrowserRouter>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

MainBody.propTypes = {
  classes: PropTypes.shape().isRequired
};

export default withStyles(Styles)(MainBody);
