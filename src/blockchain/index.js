import { LiquidPledging, LPVault } from 'giveth-liquidpledging';

import LiquidPledgingMonitor from './LiquidPledgingMonitor';
import FailedTxMonitor from './FailedTxMonitor';
import balanceMonitor from './balanceMonitor';

const { getWeb3, DISCONNECT_EVENT, RECONNECT_EVENT } = require('./web3Helpers');

export default function() {
  const app = this;
  const blockchain = app.get('blockchain');

  const web3 = getWeb3();

  const opts = {
    startingBlock: blockchain.startingBlock,
    requiredConfirmations: blockchain.requiredConfirmations,
  };

  // initialize the event listeners
  const balMonitor = balanceMonitor();
  balMonitor.start();

  const txMonitor = new FailedTxMonitor(web3, app);
  txMonitor.start();

  const liquidPledging = new LiquidPledging(web3, blockchain.liquidPledgingAddress);
  liquidPledging.$vault = new LPVault(web3, blockchain.vaultAddress);

  const lpMonitor = new LiquidPledgingMonitor(app, web3, liquidPledging, txMonitor, opts);
  lpMonitor.start();

  web3.on(DISCONNECT_EVENT, () => {
    txMonitor.close();
  });

  web3.on(RECONNECT_EVENT, () => {
    // web3.setProvider will clear any existing subscriptions, so we need to re-subscribe
    txMonitor.start();
    if (lpMonitor) {
      lpMonitor.start();
    }
  });
}
