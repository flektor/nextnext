
import { describe, it, assertEqual, assert } from '../src/tinyTest'
import { createSignal, effect } from './signals'

describe('Signals', () => {

  it('returns the value', () => {
    const [value] = createSignal(420)
    assertEqual(420, value())
    assertEqual(420, value())
  })


  it('sets the value', () => {
    const [value, setValue] = createSignal(420)
    assertEqual(420, value())
    assertEqual(420, value())

    setValue(69)
    assertEqual(69, value())
    assertEqual(69, value())
  })


  describe('Effect', () => {
    it('calls the callback when the effect is called', () => {
      let called = false
      effect(() => called = true)
      assert(called)
    })


    it('calls the callback when the signal changes value', () => {
      const [value, setValue] = createSignal(0)
      let double = 0

      effect(() => double = value() * 2)
      assertEqual(double, 0)

      setValue(3)
      assertEqual(value(), 3)
      assertEqual(double, 6)

      setValue(10)
      assertEqual(value(), 10)
      assertEqual(double, 20)
    })


    it('calls all the callbacks when the signal changes value', () => {
      const [value, setValue] = createSignal(0)
      let double1 = 0
      let double2 = 0
      let double3 = 0

      effect(() => double1 = value() * 2)
      effect(() => double2 = value() * 2)
      effect(() => double3 = value() * 2)

      assertEqual(double1, 0)
      assertEqual(double2, 0)
      assertEqual(double3, 0)

      setValue(10)
      assertEqual(double1, 20)
      assertEqual(double2, 20)
      assertEqual(double3, 20)
    })


    it('supports multiple signals in a single effect', () => {
      const [value1] = createSignal(3)
      const [value2] = createSignal(4)
      let output = 0

      effect(() => output = value1() * value2())

      assertEqual(output, 12)
    })

  })

  describe('Entangled signals', () => {

    it('supports 2 entangled signals', () => {
      const [value, setValue] = createSignal(0)
      const [double, setDouble] = createSignal(value() * 2)

      effect(() => setDouble(value() * 2))

      setValue(20)
      assertEqual(double(), 40)
      setValue(1)
      assertEqual(double(), 2)
    })


    it('supports 3 entangled signals', () => {
      const [value, setValue] = createSignal(0)
      const [double, setDouble] = createSignal(value() * 2)
      const [quadruple, setQuadruple] = createSignal(double() * 2)

      effect(() => setDouble(value() * 2))
      effect(() => setQuadruple(double() * 2))

      setValue(20)
      assertEqual(double(), 40)
      assertEqual(quadruple(), 80)
      setValue(1)
      assertEqual(double(), 2)
      assertEqual(quadruple(), 4)
    })


    it('supports entangled signals in a single effect', () => {
      const [value1, setValue1] = createSignal(3)
      const [value2, setValue2] = createSignal(4)
      const [sum, setSum] = createSignal(0)

      effect(() => setSum(value1() + value2()))
      assertEqual(sum(), 7)

      setValue1(10)
      assertEqual(sum(), 14)

      setValue1(1)
      setValue2(1)
      assertEqual(sum(), 2)
    })
  })
})
