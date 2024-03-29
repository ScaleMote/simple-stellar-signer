<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { BarLoader } from 'svelte-loading-spinners';

    import { VisibilityOffIcon, VisibilityOnIcon } from '../../../assets';
    import type { WalletConnectService } from '../../../lib/service/walletConnect';
    import WalletConnect from '../../../lib/wallets/walletConnect/WalletConnect';
    import { language } from '../../../store/global';
    import { removeDuplicates } from '../../utils/utils';
    import type IWallet from '../../wallets/IWallet';
    import WalletFactory from '../../wallets/WalletFactory';
    import PrivateKey from '../../wallets/privateKey/PrivateKey';
    import LoadingWallet from './LoadingWallet.svelte';
    import Wallet from './Wallet.svelte';
    import { inputValue, isPrivateKeyFormVisible, isPrivateKeyInvalid, isPrivateKeyVisible } from './walletsStore';

    export let wallets: string[];
    export let walletConnectService: WalletConnectService;
    const walletFactory = new WalletFactory();
    const dispatch = createEventDispatcher();

    function createWalletsByDefault(): IWallet[] {
        const wallets = walletFactory.createAll();
        const walletConnect = walletFactory.createWalletConnect(walletConnectService);

        return wallets.concat(walletConnect);
    }

    async function sortWallets(walletList: IWallet[]): Promise<IWallet[]> {
        const sortedWalletList = [];
        for (let wallet of walletList) {
            const isInstalled = await wallet.isInstalled();

            if (isInstalled) {
                sortedWalletList.unshift(wallet);
            } else {
                sortedWalletList.push(wallet);
            }
        }

        return sortedWalletList;
    }

    let filteredWallets: IWallet[];
    let sortedWallets: IWallet[] = [];
    if (wallets.length) {
        filteredWallets = removeDuplicates(wallets).map((wallet) => {
            if (wallet === WalletConnect.NAME) {
                return walletFactory.createWalletConnect(walletConnectService);
            } else {
                return walletFactory.create(wallet);
            }
        });

        (async () => {
            sortedWallets = await sortWallets(filteredWallets);
        })();
    } else {
        (async () => {
            filteredWallets = createWalletsByDefault();
            sortedWallets = await sortWallets(filteredWallets);
        })();
    }

    async function connectWithPrivateKey(privateKey: string): Promise<void> {
        const wallet = walletFactory.create(PrivateKey.NAME);
        validateInputPrivateKey(privateKey);
        const publicKey = await wallet.getPublicKey(privateKey);
        dispatchOnConnectEvent(wallet, publicKey);
    }

    function handleWalletConnect(event: CustomEvent): void {
        const wallet: IWallet = event.detail.wallet;
        const publicKey: string = event.detail.publicKey;

        if (wallet.getName() === PrivateKey.NAME) {
            $isPrivateKeyFormVisible = true;
        } else {
            dispatchOnConnectEvent(wallet, publicKey);
        }
    }

    function validateInputPrivateKey(privateKey: string) {
        const privateKeyRegEx = /^S[A-Za-z0-9]{55}$/;
        if (!privateKeyRegEx.test(privateKey)) {
            $isPrivateKeyInvalid = true;
        } else {
            $isPrivateKeyInvalid = false;
        }
    }

    $: if (!$inputValue.length) {
        $isPrivateKeyInvalid = false;
    }

    function dispatchOnConnectEvent(wallet: IWallet, publicKey: string): void {
        dispatch('connect', {
            wallet,
            publicKey,
        });
    }

    function clearPrivateKeyInput() {
        $isPrivateKeyFormVisible = !$isPrivateKeyFormVisible;
        $inputValue = '';
    }
</script>

{#if $isPrivateKeyFormVisible}
    <div class="simple-signer private-key-form">
        <div class="simple-signer form-items">
            <div class="simple-signer header-form">
                <div class="simple-signer wallet-logo private-key">
                    <svelte:component this={PrivateKey.SVG_ICON} />
                </div>
                <span class="private-key-title">{PrivateKey.FRIENDLY_NAME}</span>
            </div>
            <div class="simple-signer input-form">
                <div class="simple-signer input-flex-column">
                    {#if $isPrivateKeyVisible}
                        <input
                            class="simple-signer input-private-key {$isPrivateKeyInvalid ? 'invalid-key' : ''}"
                            id="input-key"
                            type="text"
                            bind:value={$inputValue}
                            placeholder="Input key here"
                        />
                    {:else}
                        <input
                            class="simple-signer input-private-key {$isPrivateKeyInvalid ? 'invalid-key' : ''}"
                            id="input-key"
                            type="password"
                            bind:value={$inputValue}
                            placeholder="Input key here"
                        />
                    {/if}

                    <span class="simple-signer error-private-key {$isPrivateKeyInvalid ? '' : 'hidden'}"
                        >{$language.INVALID_KEY}</span
                    >
                </div>
                <button
                    class="simple-signer visibility-key-btn"
                    on:click={() => ($isPrivateKeyVisible = !$isPrivateKeyVisible)}
                >
                    {#if $isPrivateKeyVisible}
                        <VisibilityOnIcon />
                    {:else}
                        <VisibilityOffIcon />
                    {/if}
                </button>
            </div>

            <div class="simple-signer btn-form">
                <button class="simple-signer cancel-btn" on:click={() => clearPrivateKeyInput()}
                    >{$language.CANCEL}</button
                >
                <button class="simple-signer connect-btn" on:click={() => connectWithPrivateKey($inputValue)}>
                    {$language.CONNECT_WITH_PRIVATE_KEY}
                </button>
            </div>
        </div>
    </div>
{:else if !sortedWallets.length}
    <div class="simple-signer wallets-loading-container">
        <p>{$language.LOADING}</p>
        <BarLoader color="#2f69b7" size={70} />
    </div>
{:else}
    {#each sortedWallets as wallet}
        {#await wallet.isInstalled()}
            <LoadingWallet />
        {:then isInstalled}
            <Wallet wallet={wallet} isInstalled={isInstalled} on:connect={handleWalletConnect} />
        {/await}
    {/each}
{/if}

<style>
    .hidden {
        opacity: 0%;
    }

    .wallets-loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: 'Roboto', sans-serif;
    }

    .input-flex-column {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .error-private-key {
        color: #ff6565;
        font-weight: 300;
        margin-top: 7px;
        margin-left: 10px;
    }
    .input-form {
        margin-top: 40px;
        margin-bottom: 7px;
        display: flex;
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
    }
    .btn-form {
        height: 39px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
    }
    .private-key-title {
        color: #000000;
        margin-left: 18px;
    }
    .header-form {
        display: flex;
        margin-top: 13px;
        margin-left: 10px;
        align-items: center;
    }
    .form-items {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 310px;
        max-width: 310px;
    }

    .input-private-key {
        width: 240px;
        height: 36px;
        margin-left: 10px;
        font-size: 16px;
        border: 1px solid #e5e5e5;
        text-indent: 10px;
        font-family: 'Roboto', sans-serif;
    }

    .invalid-key {
        outline: none;
        border-color: #ff6565;
    }

    .input-private-key:focus::placeholder {
        color: transparent;
    }

    .input-private-key::placeholder {
        opacity: 50%;
    }

    .input-private-key:focus {
        outline: none;
        border-color: #484848;
    }

    .wallet-logo {
        height: 30px;
        display: flex;
        align-items: center;
    }

    .wallet-logo.private-key {
        width: 30px;
    }

    .private-key-form {
        font-family: 'Roboto', sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #bdbdbd;
        box-shadow: 0px 3px 8px -2px;
        width: 310px;
    }
    .visibility-key-btn {
        height: 38px;
        width: 38px;
        box-shadow: 0px 2px 1px #00000029;
        border: 1px solid #e5e5e5;
        margin-right: 10px;
        cursor: pointer;
    }

    .connect-btn,
    .cancel-btn {
        font-size: 16px;
        font-family: 'Roboto', sans-serif;
        font-weight: bold;
        box-shadow: 0px 4px 2px #00000029;
        width: 140px;
        height: 100%;
        border: none;
        cursor: pointer;
    }

    .connect-btn {
        color: white;
        background: #2f69b7 0% 0% no-repeat padding-box;
        margin-right: 10px;
    }

    .connect-btn:hover,
    .cancel-btn:hover {
        opacity: 50%;
    }

    .cancel-btn {
        color: #000000;
        margin-left: 10px;
    }
</style>
