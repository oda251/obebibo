require 'rails_helper'

RSpec.describe "Basic endpoint tests", type: :request do
  describe "Public endpoints" do
    it "GET / returns success" do
      get "/"
      expect(response).to have_http_status(200)
    end

    it "GET /campaigns returns success" do
      get "/campaigns"
      expect(response).to have_http_status(200)
    end

    it "GET /login returns success" do
      get "/login"
      expect(response).to have_http_status(200)
    end

    it "GET /register returns success" do
      get "/register" 
      expect(response).to have_http_status(200)
    end

    it "GET /terms returns success" do
      get "/terms"
      expect(response).to have_http_status(200)
    end

    it "GET /privacy returns success" do
      get "/privacy"
      expect(response).to have_http_status(200)
    end

    it "GET /inquiry returns success" do
      get "/inquiry"
      expect(response).to have_http_status(200)
    end
  end
end