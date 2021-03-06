import {useDocRepoStore} from "../../../../../apps/repository/js/doc_repo/DocRepoStore2";
import {Reducers} from "polar-shared/src/util/Reducers";
import {useUserInfoContext} from "../auth_handler/UserInfoProvider";
import {Plans} from "polar-accounts/src/Plans";
import {AccountUpgrades} from "../../../accounts/AccountUpgrades";
import computeStorageForPlan = AccountUpgrades.computeStorageForPlan;
import {Percentage} from "polar-shared/src/util/ProgressTracker";
import {Percentage100, Percentages} from "polar-shared/src/util/Percentages";

export type Bytes = number;

interface IAccounting {
    readonly storage: Bytes;
    readonly nrWebCaptures: number;
}

/**
 * Simple accounting function to keep track of storage.
 */
export function useAccounting(): IAccounting {

    const {data} = useDocRepoStore(['data']);

    const storage = data.map(current => current.docInfo.bytes || 0)
                        .reduce(Reducers.SUM, 0)

    const nrWebCaptures = data.filter(current => current.docInfo.webCapture)
                              .length;

    return {storage, nrWebCaptures};

}

/**
 * A resource that is billed and its current value and limit and percentage usage.
 */
interface BilledResource {
    readonly value: number;
    readonly limit: number | undefined;
    readonly usage: Percentage100 | undefined;
}

interface IAccountingUsage {
    readonly storage: BilledResource;
    readonly webCaptures: BilledResource;
}

export function useAccountingUsage(): IAccountingUsage {

    const userInfoContext = useUserInfoContext();
    const accounting = useAccounting();

    function computeStorage(): BilledResource {

        const plan = Plans.toV2(userInfoContext?.userInfo?.subscription.plan || 'free');

        const value = accounting.storage;
        const limit = computeStorageForPlan(userInfoContext?.userInfo?.creationTime, plan);
        const usage = Percentages.calculate(value, limit);

        return {
            value, limit, usage
        };

    }

    function computeWebCaptures(): BilledResource {

        const plan = Plans.toV2(userInfoContext?.userInfo?.subscription.plan || 'free');

        const value = accounting.nrWebCaptures;
        const limit = plan.level === 'free' ? 250 : undefined;

        if (limit === undefined) {

            return {
                value, limit: undefined, usage: undefined
            };

        } else {

            const usage = Percentages.calculate(value, limit);

            return {
                value, limit, usage
            };

        }

    }


    const storage = computeStorage();
    const webCaptures = computeWebCaptures();

    return {storage, webCaptures};

}