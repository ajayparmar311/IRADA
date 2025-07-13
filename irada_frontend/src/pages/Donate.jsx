import '../css/donate.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import PageHeader from '../components/PageHeader'
import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function Donate() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState(100)
  const [message, setMessage] = useState('')
  const MySwal = withReactContent(Swal)

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!name || !email || !phone) {
      MySwal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
      })
      return
    }

    const loading = MySwal.fire({
      title: 'Initializing payment',
      text: 'Please wait...',
      didOpen() {
        MySwal.showLoading()
      },
      allowOutsideClick: false,
    })

    try {
      // 1. Create donation record in your database
      const donationData = {
        name,
        email,
        phone,
        amount,
        message,
        status: 'initiated',
      }

      const createDonationResponse = await axios.post(
        'http://localhost:5000/api/v1/donate',
        donationData
      )

      // 2. Initialize Razorpay payment
      const res = await loadScript(
        'https://checkout.razorpay.com/v1/checkout.js'
      )

      if (!res) {
        loading.close()
        MySwal.fire({
          title: 'Error',
          text: 'Razorpay SDK failed to load. Please check your internet connection.',
          icon: 'error',
        })
        return
      }

      // 3. Create Razorpay order
      const orderResponse = await axios.post(
        'http://localhost:5000/api/v1/donate/pay',
        {
          amount: amount * 100, // Razorpay expects amount in paise
          currency: 'INR',
          donationId: createDonationResponse.data.donationId,
        }
      )

      const {
        id: order_id,
        amount: order_amount,
        currency,
      } = orderResponse.data

      // 4. Open Razorpay checkout
      const options = {
        key: orderResponse.data.key, // Your Razorpay key
        amount: order_amount.toString(),
        currency,
        name: 'The Sanjivani NGO',
        description: 'Donation for Sanjivani Charity',
        image: 'https://i.ibb.co/pWxpKHz/checkout.jpg',
        order_id: order_id,
        handler: async function (response) {
          // 5. Verify payment and update donation record
          try {
            const verificationResponse = await axios.post(
              'http://localhost:5000/api/v1/donate/pay/verify',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                donationId: createDonationResponse.data.donationId,
              }
            )

            loading.close()
            MySwal.fire({
              icon: 'success',
              title: 'Thank you for your donation!',
              text: `Payment ID: ${response.razorpay_payment_id}`,
              confirmButtonText: 'Close',
            })
          } catch (error) {
            console.error('Verification error:', error)
            loading.close()
            MySwal.fire({
              icon: 'error',
              title: 'Payment verification failed',
              text: 'Please contact support with your payment details',
            })
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: '#010457',
        },
      }

      loading.close()
      const paymentObject = new window.Razorpay(options)
      paymentObject.open()

      paymentObject.on('payment.failed', (response) => {
        MySwal.fire({
          icon: 'error',
          title: 'Payment failed',
          text: response.error.description,
        })
      })
    } catch (error) {
      console.error('Payment error:', error)
      loading.close()
      MySwal.fire({
        icon: 'error',
        title: 'Error processing payment',
        text: error.response?.data?.message || 'Please try again later',
      })
    }
  }

  return (
    <>
      <Navbar />
      <PageHeader title={'Donate Now'} path={'/donate'} name={'Donate'} />

      <div className="donations">
        <div className="container">
          <div className="donate">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="donate-content">
                  <div className="section-header">
                    <p>Donate Now</p>
                    <h2>
                      Let's donate to Empowering Rural Roots, Restoring Earth's
                      Balance
                    </h2>
                  </div>
                  <div className="donate-text">
                    <p>
                      Your contribution helps us make a difference. Every rupee
                      counts in our mission to create positive change in rural
                      communities and restore environmental balance.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="donate-form">
                  <form onSubmit={handleSubmit}>
                    <div className="control-group">
                      <input
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        className="form-control"
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div className="control-group">
                      <input
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div className="control-group">
                      <input
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                        className="form-control"
                        placeholder="Phone Number"
                        required
                      />
                    </div>
                    <div className="control-group">
                      <textarea
                        onChange={(e) => setMessage(e.target.value)}
                        className="form-control"
                        placeholder="Optional Message (How would you like your donation to be used?)"
                        rows="3"
                      />
                    </div>
                    <div className="btn-group" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="btnradio"
                        id="btnradio1"
                        defaultChecked
                        onChange={() => setAmount(100)}
                      />
                      <label
                        htmlFor="btnradio1"
                        className="btn btn-custom btn-outline-warning"
                      >
                        ₹100
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="btnradio"
                        id="btnradio2"
                        onChange={() => setAmount(500)}
                      />
                      <label
                        htmlFor="btnradio2"
                        className="btn btn-custom btn-outline-warning"
                      >
                        ₹500
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="btnradio"
                        id="btnradio3"
                        onChange={() => setAmount(1000)}
                      />
                      <label
                        htmlFor="btnradio3"
                        className="btn btn-custom btn-outline-warning"
                      >
                        ₹1000
                      </label>
                    </div>
                    <div className="control-group">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Or enter custom amount"
                        min="10"
                        onChange={(e) =>
                          setAmount(parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <button className="btn btn-custom" type="submit">
                        Donate Now
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  )
}
