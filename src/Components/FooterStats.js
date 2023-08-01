import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import { destroyWallet, updateWallet } from '../store';

const WalletStats = () => {

    const { btc, wallets, entries } = useSelector (state => state)

    const walletHash = useLocation().hash;
    const id = walletHash.slice(14, walletHash.length);

    if(!entries) return null;
    if(!wallets) return null;

    const _wallet = wallets.find(wallet => wallet.id === id);

    const dispatch = useDispatch();

    const [name, setName] = useState('');
    const [editNameToggle, setEditNameToggle] = useState(true);
    const [showMore, setShowMore] = useState(false);

    console.log('showing more', showMore);

    const toggleNameInput = () => {
        setEditNameToggle(false);
    }

    const updateName = async(ev) => {
        ev.preventDefault();
        await dispatch(updateWallet({ id, name }));
        setEditNameToggle(true);
    }

    const _destroyWallet = (wallet) => {
        dispatch(destroyWallet(wallet));
    }

    useEffect(() => {
        if(_wallet){
            setName(_wallet.name);
        }
    }, [])

    if(!_wallet) return null;
    
    const _entries = entries.filter(entry => entry.walletId === _wallet.id)

    const btcSubtotal = _entries.map(entry => entry.btc).reduce((acc, val) => {
        acc += (val * 1);
        return acc;
    }, 0);

    const soldTotal = _entries.filter(entry => (entry.isSale)).map(entry => (entry.soldBtc * entry.price) ).reduce((acc, val) => {
        acc += val * 1;
        return acc;
    }, 0);

    const soldBtcTotal = _entries.filter(entry => (entry.isSale)).map(entry => (entry.soldBtc) ).reduce((acc, val) => {
        acc += val * 1;
        return acc;
    }, 0);

    const btcTotal = () => {
        return btcSubtotal - soldBtcTotal;
    }

    const usdTotal = () => {
        return btcTotal() * btc.price;
    }

    const usdSpend = () => {
        const totalVolume = _entries.map(entry => entry.volume).reduce((acc, val) => {
            acc += (val * 1);
            return acc;
        }, 0);

        return ((totalVolume - soldTotal) > 0) ? (totalVolume - soldTotal) : 0
    }

    const usdAvg = () => {
        return ((usdSpend() / btcTotal()) * 1);
    }

    const usdDiff = () => {
        return ((usdTotal() - usdSpend()))
    }

    const allTimeDiff = () => {
        return ((usdTotal() - usdSpend()) + soldTotal)
    }

    const usdPerc = () => {
        return ((usdDiff() / usdSpend()) * 1);
    }

    const allTimePerc = () => {
        return ((allTimeDiff() / usdSpend()) * 1);
    }

    const custLocaleString = (num) => {
        return num.toLocaleString("en-US", {style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2})
    }

    const custPerc = (num) => {
        return num.toLocaleString("en-US", {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2})
    }

    return(
        <div onClick={ () => setShowMore(!showMore) }>
                        <div className='ft-totalBTC'>


                        <span className='ft-summary-title'>BTC Total</span>: { btcTotal().toFixed(8) } {btcSubtotal > 0 && <span style={{marginLeft: '.25rem'}}>@ { custLocaleString(usdAvg()) }</span>}
                </div>
            <div id='ft-summary-container-small'>
                <div className='ft-title-alltime'>
                    <div id='ft-stats-title'>
                        <div className='ft-summary-total-usd'>
                            <span className='ft-summary-title' style={{ color: '#33bbce' }}>USD Value:</span> { custLocaleString(usdTotal()) }
                        </div>
                        <div className='ft-summary-total-usd'>
                            <span className='ft-summary-title' style={{color: 'orange'}}>USD Spend:</span> { custLocaleString(usdSpend()) }
                        </div>
                        {showMore === true && (
                            <div className='ft-summary-total-usd'>
                            <span className='ft-summary-title'>USD Avg.:</span> { custLocaleString(usdAvg()) }
                        </div>
                        )}

                    </div>

                        { (soldTotal >= 0) && (
                            <div className='ft-summary-body'>
                            <div id='ft-summary-alltime' className='entry-line'>

                            <span className='ft-summary-title'>Unrealized +/-</span>: <span className={ (usdDiff() >= 0) ? 'pos-num' : 'neg-num'} id='summary-unrealized'>
                                    { custLocaleString(usdDiff()) } 
                                    {btcSubtotal > 0 && <span style={{marginLeft: '.25rem'}}>({ custPerc(usdPerc())})
                                    </span>}
                                </span>

                            </div>

                            {showMore === true && (
                                <div className='ft-summary-showMore-body'>
                                <div id='ft-summary-alltime' className='entry-line'>

                                <span className='ft-summary-title'>Realized +/-</span>: <span className={ (soldTotal > 0) ? 'pos-num' : 'neg-num' } id='summary-realized'>{ custLocaleString(soldTotal) }</span>
    
                                </div>

                                <div id='ft-summary-alltime' className='entry-line'>

                                <span className='ft-summary-title'>All-Time +/-</span>: <span className={ (allTimeDiff() > 0) ? 'pos-num' : 'neg-num' } id='summary-alltime'>{ custLocaleString(allTimeDiff()) } ({ custPerc(allTimePerc())})</span>

                                </div>

                                </div>
                                
                            )}

                            </div>
                        ) }

                </div>

            {/* { (_entries.length > 0) ? (
                <div id='ft-summary-avgspend-container' className='entry-line'>
                    
            <div id='ft-summary-realized-title'>
                            <span className='ft-summary-title'>Realized +/-</span>: <span className={ (soldTotal >= 0) ? 'pos-num' : 'neg-num' } id='summary-realized'>{ custLocaleString(soldTotal) }</span>
                        </div> 

                        <div className='entry-line' id='ft-alltime'>
                        <span className='ft-summary-title'>All-Time +/-</span>:  <span className={ (allTimeDiff() >= 0) ? 'pos-num' : 'neg-num' } id='summary-alltime'>{ custLocaleString(allTimeDiff()) } ({ custPerc(allTimePerc())})</span>
                    </div>
                </div>
            ) : '' } */}
            
            </div>
        </div>
    );
};

export default WalletStats;