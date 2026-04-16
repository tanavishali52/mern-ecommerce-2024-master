import guestOrderLookupReducer, {
  clearSearch,
  selectOrder,
  backToOrderList,
  clearError,
  setOrders,
  searchGuestOrders
} from '../index';

// Mock axios
jest.mock('axios');

describe('guestOrderLookupSlice', () => {
  const initialState = {
    isLoading: false,
    orders: [],
    searchedName: "",
    hasSearched: false,
    error: null,
    selectedOrder: null,
    showOrderDetails: false,
  };

  test('should return the initial state', () => {
    expect(guestOrderLookupReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle clearSearch', () => {
    const stateWithData = {
      isLoading: false,
      orders: [{ _id: '1' }],
      searchedName: "John Doe",
      hasSearched: true,
      error: "Some error",
      selectedOrder: { _id: '1' },
      showOrderDetails: true,
    };

    const actual = guestOrderLookupReducer(stateWithData, clearSearch());
    
    expect(actual).toEqual(initialState);
  });

  test('should handle selectOrder', () => {
    const order = { _id: '1', customerName: 'John Doe' };
    
    const actual = guestOrderLookupReducer(initialState, selectOrder(order));
    
    expect(actual.selectedOrder).toEqual(order);
    expect(actual.showOrderDetails).toBe(true);
  });

  test('should handle backToOrderList', () => {
    const stateWithSelectedOrder = {
      ...initialState,
      selectedOrder: { _id: '1' },
      showOrderDetails: true,
    };

    const actual = guestOrderLookupReducer(stateWithSelectedOrder, backToOrderList());
    
    expect(actual.selectedOrder).toBe(null);
    expect(actual.showOrderDetails).toBe(false);
  });

  test('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: "Some error"
    };

    const actual = guestOrderLookupReducer(stateWithError, clearError());
    
    expect(actual.error).toBe(null);
  });

  test('should handle setOrders with single order', () => {
    const orders = [{ _id: '1', customerName: 'John Doe' }];
    
    const actual = guestOrderLookupReducer(initialState, setOrders(orders));
    
    expect(actual.orders).toEqual(orders);
    expect(actual.selectedOrder).toEqual(orders[0]);
    expect(actual.showOrderDetails).toBe(true);
  });

  test('should handle setOrders with multiple orders', () => {
    const orders = [
      { _id: '1', customerName: 'John Doe' },
      { _id: '2', customerName: 'John Doe' }
    ];
    
    const actual = guestOrderLookupReducer(initialState, setOrders(orders));
    
    expect(actual.orders).toEqual(orders);
    expect(actual.selectedOrder).toBe(null);
    expect(actual.showOrderDetails).toBe(false);
  });

  test('should handle searchGuestOrders.pending', () => {
    const action = { type: searchGuestOrders.pending.type };
    
    const actual = guestOrderLookupReducer(initialState, action);
    
    expect(actual.isLoading).toBe(true);
    expect(actual.error).toBe(null);
    expect(actual.hasSearched).toBe(false);
  });

  test('should handle searchGuestOrders.fulfilled with single order', () => {
    const orders = [{ _id: '1', customerName: 'John Doe' }];
    const action = {
      type: searchGuestOrders.fulfilled.type,
      payload: {
        orders,
        searchedName: 'John Doe',
        message: 'Found 1 order'
      }
    };
    
    const actual = guestOrderLookupReducer(initialState, action);
    
    expect(actual.isLoading).toBe(false);
    expect(actual.orders).toEqual(orders);
    expect(actual.searchedName).toBe('John Doe');
    expect(actual.hasSearched).toBe(true);
    expect(actual.error).toBe(null);
    expect(actual.selectedOrder).toEqual(orders[0]);
    expect(actual.showOrderDetails).toBe(true);
  });

  test('should handle searchGuestOrders.fulfilled with multiple orders', () => {
    const orders = [
      { _id: '1', customerName: 'John Doe' },
      { _id: '2', customerName: 'John Doe' }
    ];
    const action = {
      type: searchGuestOrders.fulfilled.type,
      payload: {
        orders,
        searchedName: 'John Doe',
        message: 'Found 2 orders'
      }
    };
    
    const actual = guestOrderLookupReducer(initialState, action);
    
    expect(actual.isLoading).toBe(false);
    expect(actual.orders).toEqual(orders);
    expect(actual.selectedOrder).toBe(null);
    expect(actual.showOrderDetails).toBe(false);
  });

  test('should handle searchGuestOrders.rejected', () => {
    const action = {
      type: searchGuestOrders.rejected.type,
      payload: {
        message: 'No orders found',
        searchedName: 'Jane Smith'
      }
    };
    
    const actual = guestOrderLookupReducer(initialState, action);
    
    expect(actual.isLoading).toBe(false);
    expect(actual.orders).toEqual([]);
    expect(actual.searchedName).toBe('Jane Smith');
    expect(actual.hasSearched).toBe(true);
    expect(actual.error).toBe('No orders found');
  });
});