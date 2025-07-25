class Api::ApplicationController < ActionController::API
  include ActionController::RequestForgeryProtection
  
  protect_from_forgery with: :null_session
  before_action :authenticate_user!, except: [:index, :show]

  respond_to :json

  private

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_success(data = {}, message = nil)
    response = data
    response[:message] = message if message
    render json: response
  end
end