/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PropType } from 'vue'

export const useDefinePropType = <T>(val: any): PropType<T> => val
