// Utility function to get order status badge styling
export const getOrderStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-orange-500 text-white';
    case 'confirmed':
      return 'bg-green-500 text-white';
    case 'inprocess':
    case 'in process':
      return 'bg-yellow-600 text-white';
    case 'inshipping':
    case 'in shipping':
      return 'bg-purple-600 text-white';
    case 'delivered':
      return 'bg-blue-600 text-white';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

// Utility function to format status display text
export const formatOrderStatus = (status) => {
  if (!status) return 'Unknown';
  
  switch (status.toLowerCase()) {
    case 'inprocess':
      return 'In Process';
    case 'inshipping':
      return 'In Shipping';
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'delivered':
      return 'Delivered';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};