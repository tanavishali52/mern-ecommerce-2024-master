import orderConfirmationReducer, {
  showOrderConfirmation,
  hideOrderConfirmation,
  updateCountdown,
  stopCountdown,
  setRedirecting,
  resetConfirmation
} from '../index';

describe('orderConfirmationSlice', () => {
  const initialState = {
    isModalOpen: false,
    orderData: null,
    countdown: 5,
    isRedirecting: false,
  };

  test('should return the initial state', () => {
    expect(orderConfirmationReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle showOrderConfirmation', () => {
    const orderData = {
      orderId: '123',
      totalAmount: 99.99,
      customerName: 'John Doe'
    };

    const actual = orderConfirmationReducer(initialState, showOrderConfirmation(orderData));
    
    expect(actual.isModalOpen).toBe(true);
    expect(actual.orderData).toEqual(orderData);
    expect(actual.countdown).toBe(5);
    expect(actual.isRedirecting).toBe(false);
  });

  test('should handle hideOrderConfirmation', () => {
    const stateWithModal = {
      isModalOpen: true,
      orderData: { orderId: '123' },
      countdown: 3,
      isRedirecting: true,
    };

    const actual = orderConfirmationReducer(stateWithModal, hideOrderConfirmation());
    
    expect(actual).toEqual(initialState);
  });

  test('should handle updateCountdown', () => {
    const actual = orderConfirmationReducer(initialState, updateCountdown(3));
    
    expect(actual.countdown).toBe(3);
  });

  test('should handle stopCountdown', () => {
    const actual = orderConfirmationReducer(initialState, stopCountdown());
    
    expect(actual.countdown).toBe(-1);
  });

  test('should handle setRedirecting', () => {
    const actual = orderConfirmationReducer(initialState, setRedirecting(true));
    
    expect(actual.isRedirecting).toBe(true);
  });

  test('should handle resetConfirmation', () => {
    const stateWithData = {
      isModalOpen: true,
      orderData: { orderId: '123' },
      countdown: 2,
      isRedirecting: true,
    };

    const actual = orderConfirmationReducer(stateWithData, resetConfirmation());
    
    expect(actual).toEqual(initialState);
  });
});