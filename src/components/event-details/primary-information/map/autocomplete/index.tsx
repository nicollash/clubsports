import React, { useRef, useState } from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import { Input } from 'components/common';
import styles from './styles.module.scss';
import { BindingCbWithOne } from 'common/models';
import useOnclickOutside from 'react-cool-onclickoutside';

export interface IPosition {
  lat: number;
  lng: number;
}

interface IPrimaryLocationParam {
  position: IPosition;
  state: string;
  city: string;
}

interface IPlaceAutocomplete {
  onSelect: BindingCbWithOne<IPrimaryLocationParam>;
  onChange: BindingCbWithOne<string>;
  address: string;
  disabled?: boolean;
  label: string;
}
const PlacesAutocompleteInput = ({
  onSelect,
  onChange,
  address,
  disabled,
  label,
}: IPlaceAutocomplete) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = async (value: string) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    const state = results[0].address_components.filter(component =>
      component.types.includes('administrative_area_level_1')
    )[0];
    const city = results[0].address_components.filter(component =>
      component.types.includes('locality')
    )[0];
    onChange(value);
    onSelect({
      position: latLng,
      state: state?.long_name || '',
      city: city?.long_name || '',
    });
  };

  const [isVisible, setVisibility] = useState(true);

  useOnclickOutside(ref, () => {
    setVisibility(false);
  });

  const onChangeInput = (value: string) => {
    if (!isVisible) {
      setVisibility(true);
    }
    onChange(value);
  };

  return (
    <div>
      <PlacesAutocomplete
        value={address}
        onChange={onChangeInput}
        onSelect={handleSelect}
        debounce={600}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps }) => (
          <div ref={ref}>
            <Input
              {...getInputProps({
                placeholder: 'Search Google Maps',
                label,
                disabled,
              })}
            />
            {isVisible && suggestions.length > 0 && (
              <div className={styles.suggestionsContainer}>
                {suggestions.map(suggestion => {
                  const style = {
                    backgroundColor: suggestion.active
                      ? 'rgba(0, 0, 0, 0.04)'
                      : '#fff',
                    padding: '6px 16px',
                    cursor: 'pointer',
                  };

                  return (
                    <div
                      {...getSuggestionItemProps(suggestion, { style })}
                      key={suggestion.id}
                    >
                      {suggestion.description}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
};

export default PlacesAutocompleteInput;
