class UsersController < ApplicationController
  before_action :authenticate_user!

  def show
    @entries = current_user.entries.includes(:campaign).recent.page(params[:page]).per(10)
    @reviews = current_user.reviews.includes(:campaign).recent.page(params[:reviews_page]).per(10)
  end
end