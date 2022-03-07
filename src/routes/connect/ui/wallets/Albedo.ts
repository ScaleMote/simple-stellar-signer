import sendMessage from '../../../../helpers/sendMessageHelpers';
import { storeItem, clearStorage } from '../../../../helpers/storage';
import type { Transaction } from 'stellar-sdk';
import type IWallet from './interfaces/IWallet';
import { StellarNetwork } from '../../../../helpers/StellarNetwork';
export default class Albedo implements IWallet {
    public static NAME = 'albedo';
    public albedoNetwork: string;

    constructor() {
        const stellarNetwork = import.meta.env.VITE_STELLAR_NETWORK;

        if (stellarNetwork === StellarNetwork.PUBLIC.toUpperCase()) {
            this.albedoNetwork = StellarNetwork.PUBLIC;
        } else {
            this.albedoNetwork = StellarNetwork.TESTNET;
        }
    }

    async getPublicKey(): Promise<string> {
        const requestPubKey = await window.albedo.publicKey({
            token: `${btoa(Math.random().toString() + Math.random().toString())}`,
        });
        const publicKey = requestPubKey.pubkey;
        return publicKey;
    }

    async logIn(): Promise<void> {
        const publicKey = await this.getPublicKey();
        clearStorage();
        storeItem('wallet', Albedo.NAME);
        sendMessage(publicKey);
    }

    async sign(tx: Transaction) {
        const signedXdr = await window.albedo.tx({ xdr: tx.toXDR(), network: this.albedoNetwork });
        return signedXdr.signed_envelope_xdr;
    }
}
