const BASE_URL = 'https://bdappsdigitalapps.com/NADB26131/';

async function postForm(endpoint, fields) {
  const body = new URLSearchParams(fields).toString();

  const response = await fetch(BASE_URL + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }

  return await response.json();
}

async function sendOtp(phoneNumber) {
  return await postForm('send_otp.php', { user_mobile: phoneNumber });
}

async function verifyOtp(otp, referenceNo) {
  return await postForm('verify_otp.php', { Otp: otp, referenceNo: referenceNo });
}

async function checkSubscription(phoneNumber) {
  return await postForm('check_subscription.php', { user_mobile: phoneNumber });
}

async function unsubscribe(phoneNumber) {
  return await postForm('unsubscribe.php', { user_mobile: phoneNumber });
}

async function unsubscribeUser(phoneNumber) {
  const body = new URLSearchParams({ user_mobile: phoneNumber }).toString();

  const response = await fetch(
    'https://bdappsdigitalapps.com/NADB26131/unsubscribe.php',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    }
  );

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }

  return await response.json();
}
