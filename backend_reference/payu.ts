/**
 * This file represents the Node.js backend logic for PayU.
 * In a real Next.js/Express app, this would be in your API routes.
 */

/*
import crypto from 'crypto';

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT;

export const generateHash = (data: any) => {
  // Pattern: key|txnid|amount|productinfo|firstname|email|udf1|udf2|...|udf10|salt
  const hashString = `${PAYU_KEY}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${PAYU_SALT}`;
  
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  return hash;
};

export const verifyPaymentHash = (data: any) => {
  // Pattern: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const hashString = `${PAYU_SALT}|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${PAYU_KEY}`;
  
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
  return calculatedHash === data.hash;
};
*/

export const MOCK_PAYU_HELPER = {
  // Helper to simulate hash generation on client for this demo
  generateHash: (txnid: string, amount: string, productinfo: string, firstname: string, email: string) => {
    // In real app, make an API call: axios.post('/api/payment/hash', { ... })
    return `mock_hash_${txnid}_${amount}`; 
  }
};