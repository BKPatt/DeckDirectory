import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface EbayConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (accessToken: string, refreshToken: string) => void;
  clientId: string;
  redirectUri: string;
}

const ConnectEbayAccount: React.FC<EbayConnectModalProps> = ({
  open,
  onClose,
  onConnect,
  clientId,
  redirectUri,
}) => {
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    if (code) {
      exchangeCodeForTokens(code);
    }
  }, []);

  const exchangeCodeForTokens = async (code: string) => {
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${process.env.REACT_APP_EBAY_CLIENT_SECRET}`)}`,
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
    });

    const data = await response.json();
    const { access_token, refresh_token } = data;

    onConnect(access_token, refresh_token);
    onClose();
  };

  const handleEbayAuth = () => {
    window.location.href = `https://auth.ebay.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Connect Your eBay Account</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To connect your eBay account, you'll need to grant permission for our website to access your account
          information.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleEbayAuth} autoFocus>
          Authorize with eBay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectEbayAccount;