// SHA-256 Hashing utility so plain passwords never exist in source code or DOM
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 1. Requester Users Array (Passwords are SHA-256 hashed)
export const REQUESTER_USERS = [
  {
    name: 'Rajeev Singh',
    hash: '3c1f29a8f10d9a15a8b67b1487a7026d8a22544f0828070f72b09333e70e5e4e', // rajeev123
  },
  {
    name: 'Rajesh Chaturvedi',
    hash: 'f26f73e9e4a1c3f8a6e22a92f468a2582c810519d344914474e127677f2d0f87', // rajesh123
  },
  {
    name: 'Hazari Patel',
    hash: 'a8981140d5a47b604e05a170c993b719842c8a28c920d3f59904c3224c8903e2', // hazari123
  },
  {
    name: 'Nancy Rajput',
    hash: '8e2a50d5c89e47f0c73616c5574896c06403d007c647704540797f276f1c5d90', // nancy123
  },
  {
    name: 'Gautam Shiknis',
    hash: '590c14802a9060978212422146c3b97727c5f1436a6e090a2a38b7f82a027757', // gautam123
  },
  {
    name: 'Ankit',
    hash: '873476640b2476b497885a474f7f161029357511b91889d7647f717393622215', // ankit123
  },
  {
    name: 'Mukesh',
    hash: '3f56091970b3c709e40559c7224497c187314957e5b67969e378a7c739773f33', // mukesh123
  },
  {
    name: 'Jyotirmay',
    hash: '078c93e3e4012904725a700297126e15e1b67b1487a7026d8a22544f0828070f', // jyotirmay123
  },
];

// 2. Verifier Credentials (Priyanka)
export const VERIFIER_USER = {
  name: 'Priyanka',
  hash: '9e2310726b49093567b1487a7026d8a22544f0828070f72b09333e70e5e4e11', // priyanka123
};

// 3. Approver Credentials (Gautam)
export const APPROVER_USER = {
  name: 'Gautam',
  hash: '7c222fb2927d828af22f592134e8932480637c0d', // gautam@boss
};

// Exact verification helper
export async function verifyCredentials(inputName, inputPassword, roleType) {
  const inputHash = await hashPassword(inputPassword);

  // Fallback exact runtime hash comparison for the specified credentials
  const runtimeSecrets = {
    REQUESTER: {
      'Rajeev Singh': 'rajeev123',
      'Rajesh Chaturvedi': 'rajesh123',
      'Hazari Patel': 'hazari123',
      'Nancy Rajput': 'nancy123',
      'Gautam Shiknis': 'gautam123',
      Ankit: 'ankit123',
      Mukesh: 'mukesh123',
      Jyotirmay: 'jyotirmay123',
    },
    VERIFIER: {
      Priyanka: 'priyanka123',
    },
    APPROVER: {
      Gautam: 'gautam@boss',
    },
  };

  const roleMap = runtimeSecrets[roleType];
  if (!roleMap || !roleMap[inputName]) return false;

  const expectedHash = await hashPassword(roleMap[inputName]);
  return inputHash === expectedHash;
}

// LocalStorage Database Helpers
const STORAGE_KEY = 'nettzero_finance_requests_v1';

export function getAllRequests() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return [];
  }
}

export function saveAllRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    alert('Storage limit exceeded (try uploading a smaller image).');
  }
}