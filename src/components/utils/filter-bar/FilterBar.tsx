import { useState } from 'react';
import { useStoreStatus } from '../../../store/StoreProviderStatus';
import { ComboForm, ComboOption } from '../../../interfaces/ComboOption';
import { Combo } from '../combo/Combo';

import './FilterBar.css';

interface FilterBarProps {
    filterDefault: string
    filterTargets: string[]
    options: ComboForm[]
    cache?: CacheProps
    onFilterChange: (target: string, value: string) => void
}

interface CacheProps {
    keyTarget: string
    keyValue: string
}

export interface PayloadFilter {
    target: string;
    value: string;
}

export const emptyFilter = (filterDefault: string): PayloadFilter => ({
    target: filterDefault,
    value: "",
})

export function FilterBar({ filterDefault: defaultTarget, filterTargets: validTargets, options, cache, onFilterChange }: FilterBarProps) {
    const { find, store } = useStoreStatus();

    const makePaylaod = (): PayloadFilter => {
        if (!cache) {
            return {
                target: defaultTarget,
                value: ""
            };
        }

        return {
            target: find(cache.keyTarget, {
                def: defaultTarget,
                range: validTargets,
            }),
            value: find(cache?.keyValue, {
                def: ""
            })
        };
    }

    const [filterData, setFilterData] = useState<PayloadFilter>(makePaylaod());

    const onFilterTargetChange = (value: string) => {
        const target = validTargets.find(c => c == value) || defaultTarget;

        setFilterData((prevData) => ({
            ...prevData,
            target: target,
        }));

        onFilterChange(target, filterData.value);

        if (cache) {
            store(cache.keyTarget, target);
        }
    }

    const onFilterValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateFilterValue(event.target.value);
    }

    const onFilterValueClean = () => {
        updateFilterValue("");
    }

    const updateFilterValue = (value: string) => {
        setFilterData((prevData) => ({
            ...prevData,
            value: value,
        }));

        onFilterChange(filterData.target, value);

        if (cache) {
            store(cache.keyValue, value);
        }
    }

    const searchOptions = (): ComboOption[] => {
        const opts: ComboOption[] = [];

        for (const option of options) {
            opts.push({
                ...option,
                action: () => onFilterTargetChange(option.name)
            });
        }

        return opts;
    }

    return (
        <div id="search-box">
            <button id="clean-filter" title="Clean filter" onClick={onFilterValueClean}></button>
            <input className="search-input" type="text" value={filterData.value} onChange={onFilterValueChange} placeholder={filterData.target} />
            <div className="search-combo-container">
                <Combo
                    custom={(
                        <span>🔎</span>
                    )}
                    mode="select"
                    focus={filterData.target}
                    options={searchOptions()} />
            </div>
        </div>
    );
}