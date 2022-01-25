import React from 'react';
import { Trans } from '@lingui/macro';
import {
  Typography,
  Container,
  Grid,
} from '@material-ui/core';
// import { shuffle } from 'lodash';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAddKeyMutation, useLogInMutation } from '@chia/api-react';
import { useNavigate } from 'react-router';
import { Autocomplete, ButtonLoading, Form, Flex, Logo, useShowError, useTrans } from '@chia/core';
import { english } from '@chia/api';

/*
const shuffledEnglish = shuffle(english);
const test = new Array(24).fill('').map((item, index) => shuffledEnglish[index].word);
*/

<<<<<<< HEAD
const options = english.map((item) => item.word);

type FormData = {
  mnemonic: string[];
=======
const emptyMnemonic = Array.from(Array(24).keys()).map((i) => ({
  word: '',
}))

const options = english.map((item) => item.word);

type FormData = {
  mnemonic: {
    word: string;
  }[];
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
};

export default function WalletImport() {
  const navigate = useNavigate();
  const [addKey, { isLoading: isAddKeyLoading }] = useAddKeyMutation();
  const [logIn, { isLoading: isLogInLoading }] = useLogInMutation();
  const trans = useTrans();
<<<<<<< HEAD
  const showError = useShowError();
=======
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1

  const isProcessing = isAddKeyLoading || isLogInLoading;

  const methods = useForm<FormData>({
    defaultValues: {
<<<<<<< HEAD
      mnemonic: new Array(24).fill(''),
=======
      mnemonic: emptyMnemonic,
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
    },
  });

  const { fields } = useFieldArray({
    control: methods.control,
    name: 'mnemonic',
  });

<<<<<<< HEAD
  function handleBack() {
    navigate('/');
  }

=======
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
  async function handleSubmit(values: FormData) {
    if (isProcessing) {
      return;
    }

    const { mnemonic } = values;
<<<<<<< HEAD
    const hasEmptyWord = !!mnemonic.find((word) => !word);
=======
    const mnemonicWords = mnemonic.map((item) => item.word);
    const hasEmptyWord = !!mnemonicWords.filter((word) => !word).length;
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
    if (hasEmptyWord) {
      throw new Error(trans('Please fill all words'));
    }

    const fingerprint = await addKey({
<<<<<<< HEAD
      mnemonic,
=======
      mnemonic: mnemonicWords,
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
      type: 'new_wallet',
    }).unwrap();

    await logIn({
      fingerprint,
    }).unwrap();

    navigate('/dashboard/wallets/1');
  }

  return (
    <Form methods={methods} onSubmit={handleSubmit}>
      <Container maxWidth="lg">
        <Flex flexDirection="column" gap={3} alignItems="center">
          <Logo />
          <Typography variant="h4" component="h1" gutterBottom>
            <Trans>Import Wallet from Mnemonics</Trans>
          </Typography>
          <Typography variant="subtitle1" align="center">
            <Trans>
              Enter the 24 word mnemonic that you have saved in order to restore
              your Chia wallet.
            </Trans>
          </Typography>
          <Grid container spacing={2}>
            {fields.map((field, index) => (
              <Grid key={field.id} xs={2} item>
                <Autocomplete
                  options={options}
<<<<<<< HEAD
                  name={`mnemonic.${index}`}
=======
                  name={`mnemonic.${index}.word`}
>>>>>>> 207cb1a67d4bce2ecd46a9125678de02d66d71b1
                  label={index + 1}
                  autoFocus={index === 0}
                  variant="filled"
                  disableClearable
                />
              </Grid>
            ))}
          </Grid>
          <Container maxWidth="xs">
            <ButtonLoading
              type="submit"
              variant="contained"
              color="primary"
              loading={isProcessing}
              fullWidth
            >
              <Trans>Next</Trans>
            </ButtonLoading>
          </Container>
        </Flex>
      </Container>
    </Form>
  );
}
