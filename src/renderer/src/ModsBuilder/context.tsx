import { createFormContext } from '@mantine/form';
import { CraftRule } from 'src/shared/interface';

export interface FormValuesType {
  rules: CraftRule[];
  prefixes: string[];
  suffixes: string[];
}

export const [FormProvider, useFormContext, useForm] = createFormContext<FormValuesType>();
