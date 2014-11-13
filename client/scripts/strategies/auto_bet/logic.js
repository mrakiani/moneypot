define(['lib/clib'], function(Clib) {

    return function (settings) {
        console.assert(settings);

        //Initial conditions object
            //settings.baseBet  //Base bet in bits
            //settings.autoCashAt //Number
            //settings.onLossSelectedOpt //Options: return_to_base(def), increase_bet_by
            //settings.onLossIncreaseQty: //null, number
            //settings.onWinSelectedOpt: //Options: return_to_base(def), increase_bet_by
            //settings.onWinIncreaseQty: //null, number

        return function(engine) {
            //MoneyBot\n\
            var baseBetSatoshis = settings.baseBet * 100;
            var currentBet = baseBetSatoshis;

            var onLossIncreaseQty = Number(settings.onLossIncreaseQty);
            var onWinIncreaseQty = Number(settings.onWinIncreaseQty);
            var autoCashAt = Number(settings.autoCashAt);
            console.assert(Clib.isNumber(autoCashAt));

            engine.on('game_starting', function() {
                var lastGamePlay = engine.lastGamePlay();

                if (lastGamePlay == 'LOST') {
                    if(settings.onLossSelectedOpt == 'return_to_base')
                        currentBet = baseBetSatoshis;
                    else { //increase_bet_by
                        console.assert(Clib.isNumber(onLossIncreaseQty));
                        currentBet = currentBet * onLossIncreaseQty;
                    }
                } else if(lastGamePlay == 'WON') {
                    if(settings.onWinSelectedOpt == 'return_to_base')
                        currentBet = baseBetSatoshis;
                    else {//increase_bet_by
                        console.assert(Clib.isNumber(onWinIncreaseQty));
                        currentBet = currentBet * onWinIncreaseQty;
                    }
                }

                var fixedCurrentBet = Math.round(currentBet / 100) * 100;

                if(fixedCurrentBet > 0 && fixedCurrentBet <= engine.getBalance() && fixedCurrentBet <= engine.getMaxBet()) {
                    engine.placeBet(fixedCurrentBet, autoCashAt * 100, false);
                } else {
                    engine.stop();
                    console.log('You ran out of bits or exceeded the max bet or betting nothing :(');
                }
            });
        }

    }
});